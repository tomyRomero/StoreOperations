import {Schema, model, models} from "mongoose";

const cartSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [
      {
        product: {
          type: String,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1, // Set a default quantity if not provided
        },
      },
    ],
  });

const Cart = models.Cart || model('Cart', cartSchema);
export default Cart;