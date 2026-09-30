import { Schema, model, models } from "mongoose";
import { getCurrentDate } from "../utils";

const activitySchema = new Schema({
    action: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    details: {
        type: Object,
        required: true,
    },
    date: {type: String, default: getCurrentDate, required: true},
}
);

const Activity = models.Activity || model('Activity', activitySchema);

export default Activity;
