import {Schema, model, models} from "mongoose";

const storeSchema = new Schema({
   newsletter: {
    type: [
        {
            type: String
        }
    ]
   },
   contact: {
    type: Object
   }
  });

const Store = models.Store || model('Store', storeSchema);

export default Store;