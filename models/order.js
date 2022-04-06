const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const orderSchema = new Schema({
  customerId: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  contact: Object,
  createdAt: {
    default: Date.now(),
    type: Number
  },
  info: String,
  items: [{
    qty: Number,
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    total: Number
  }],
  paymentType: {
    default: 'card',
    type: String
  },
  shipping: Object,
  status: { type: String, default: 'pending' },
  tax: {
    default: 0,
    type: Number
  },
  total: { type: Number, default: 0, required: true },
  updatedAt: {
    default: Date.now(),
    type: Date
  }
});

orderSchema.plugin(mongoosePaginate);
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;