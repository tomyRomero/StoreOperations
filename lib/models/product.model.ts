import {Schema, model, models} from "mongoose";
import { getCurrentDate } from "../utils";

const productSchema = new Schema({
    stripeProductId : { type: String, required: true, unique: true }, 
    name: { type: String, required: true}, 
    description: { type: String, required: true},
    stock: { type: Number, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true},
    photo: { type: String, required: true},
    date: {type: String, default: getCurrentDate, required: true}
})

// Register the 'Product' model
const Product = models.Product || model('Product', productSchema);

export default Product;