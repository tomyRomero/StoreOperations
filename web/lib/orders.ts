import "server-only";

import { connectToDB } from "./mongoose";
import User from "./models/user.model";
import Product from "./models/product.model";
import Cart from "./models/cart.model";
import Orders from "./models/orders.model";
import Activity from "./models/activity.model";

// Order bookkeeping used by the Stripe webhook after a verified payment.
// These used to be exported server actions, which let anyone create orders or
// empty another user's cart. They are now server-only and take no session:
// the webhook's Stripe signature check is what authorizes them.
// Phase 2 (payment hardening) reworks this flow; the logic is unchanged here.

interface OrderParams {
  orderId: string;
  user: string;
  items: { product: string; quantity: number }[];
  status?: string;
  address: { name: string; address: { line1: string; line2: string | null; city: string; country: string; postal_code: string; state: string } };
  pricing: { total: string; subtotal: string; taxAmount: string; shipping: string; taxtId: string };
}

export const getUserContact = async (userId: string) => {
  await connectToDB();
  const user = await User.findById(userId).select("username email").lean<{ username: string; email: string }>();
  return user ? { username: user.username, email: user.email } : null;
};

export const removeCheckout = async (userId: string) => {
  await connectToDB();
  try {
    const result = await User.updateOne({ _id: userId }, { $unset: { checkout: "" } });
    return result.matchedCount > 0;
  } catch (error) {
    console.error("Error removing checkout:", error);
    return false;
  }
};

export const removeUserCart = async (userId: string) => {
  await connectToDB();
  try {
    const result = await Cart.deleteOne({ user: userId });
    return result.deletedCount > 0
      ? { success: true, message: "User cart removed successfully" }
      : { success: false, message: "User cart not found" };
  } catch (error) {
    console.error("Error removing user cart:", error);
    return { success: false, message: "Error removing user cart" };
  }
};

export const createOrder = async (params: OrderParams): Promise<boolean> => {
  await connectToDB();
  try {
    const orderItems = await Promise.all(
      params.items.map(async (item) => {
        const product = await Product.findOne({ stripeProductId: item.product });
        if (!product) {
          console.error(`Product not found for order item: ${item.product}`);
          return { productId: item.product, productName: "Product Not Found", productPrice: "0", productImage: "", quantity: item.quantity };
        }
        return {
          productId: product._id,
          productName: product.name,
          productPrice: product.price.toString(),
          productImage: product.photo,
          quantity: item.quantity,
        };
      })
    );

    await Orders.create({
      orderId: params.orderId,
      user: params.user,
      items: orderItems,
      status: params.status || "Pending",
      address: params.address,
      pricing: params.pricing,
    });

    await Activity.create({
      action: "order_created",
      timestamp: new Date(),
      details: { orderId: params.orderId, user: params.user, pricing: params.pricing, status: params.status },
    });

    return true;
  } catch (error) {
    console.error("Error creating order:", error);
    return false;
  }
};

export const updateProductStockAfterPurchase = async (items: { product: string; quantity: number }[]) => {
  await connectToDB();
  try {
    for (const item of items) {
      const product = await Product.findOne({ stripeProductId: item.product }).select("stock");
      if (!product) {
        console.error(`Product not found for stock update: ${item.product}`);
        continue;
      }
      await Product.updateOne({ stripeProductId: item.product }, { stock: product.stock - item.quantity });
    }
  } catch (error) {
    console.error("Error updating product stock after purchase:", error);
  }
};
