import { Schema, model, models } from "mongoose";
import { getCurrentDate } from "../utils";

const ordersSchema = new Schema({
    orderId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [
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
  status: {
      type: String,
      enum: ['Pending', 'Delivered', 'Shipped', 'Cancelled' , 'Refunded'], // Define possible status values
      default: 'Pending', // Set a default status if not provided
  },
  address: {
        type: Object,
        required: true,
    },
  pricing: {
    type: Object,
    required: true,
  },
  trackingNumber: {type: String, default: ""},
  deliveryDate: {type: String, default: ""},
  date: {type: String, default: getCurrentDate, required: true},
  createdAt: {type: Date, default: Date.now, required: true }
});

const Orders = models.Orders || model('Orders', ordersSchema);

export default Orders;
