import {Schema, model, models} from "mongoose";
import { getCurrentDate } from "../utils";

const userSchema = new Schema({
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: {type: Boolean, required:true , default: false},
    date: {type: String, default: getCurrentDate, required: true},
    cart: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
      },
}); 

const User = models.User || model('User', userSchema);
export default User;

