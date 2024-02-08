import {Schema, model, models} from "mongoose";

const addressesSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    addresses: [
      {
        address: {
          type: Object,
          required: true,
        }
      },
    ],
  });

const Addresses = models.Addresses || model('Addresses', addressesSchema);

export default Addresses;