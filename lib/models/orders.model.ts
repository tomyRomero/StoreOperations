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
      enum: ['pending', 'completed', 'shipped', 'cancelled'], // Define possible status values
      default: 'pending', // Set a default status if not provided
  },
  address: {
        type: Object,
        required: true,
    },
  pricing: {
    type: Object,
    required: true,
  },
  trackingNumber: {type: String, unique: true},
  deliveryDate: {type: String},
  date: {type: String, default: getCurrentDate, required: true},
});

const Orders = models.Orders || model('Orders', ordersSchema);

export default Orders;
