const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartsSchema = new Schema({
  clientId: String,
  total: Number,
  uzsValue: { type: Number },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      qty: { type: Number, default: 1 },
      total: Number,
      color: String,
    }
  ],
  qty: Number,
  address: String,
  createdAt: { type: Number, default: Date.now() },
  updatedAt: { type: Number, default: Date.now() }
});

const Carts = mongoose.model('Cart', cartsSchema);

module.exports = Carts;