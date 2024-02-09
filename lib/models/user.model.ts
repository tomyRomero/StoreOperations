import {Schema, model, models} from "mongoose";
import { getCurrentDate } from "../utils";

const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: {type: Boolean, required:true , default: false},
    date: {type: String, default: getCurrentDate, required: true},
    stripeId: {type: String, unique:true }, 
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
      },
    checkout: {
        status: { type: String }, 
        address: { type: Object}, 
        orderid: { type: String}
    }, 
    addresses: {
        type: Schema.Types.ObjectId,
        ref: 'Addresses'
    },
    orders: {
        type: Schema.Types.ObjectId,
        ref: 'Orders'
    }
}); 

const User = models.User || model('User', userSchema);
export default User;

