import { nanoid } from 'nanoid';
import {Schema, model, models} from "mongoose";
import { getCurrentDate } from "../utils";

const categorySchema = new Schema({
    id: { type: String, default: () => nanoid(), unique: true },
    title: {type: String, required: true, unique: true},
    photo: {type: String, required: true, unique: true},
    date: {type: String, default: getCurrentDate, required: true}
}); 

// Register the 'Category' model
const Category = models.Category || model('Category', categorySchema);

export default Category;
