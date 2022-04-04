const mongoose = require('mongoose');
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const productsSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  categoryName: {
    type: String,
    require: true
  },
  color: String,
  createdAt: {
    default: Date.now(),
    type: Date
  },
  creator: {
    type: String
  },
  description: String,
  img: String,
  name: String,
  price: {
    require: true,
    type: Number
  },
  priceUnit: {
    default: 'uzs',
    type: String
  },
  uzsValue: {
    type: Number,
  },
  quantity: {
    require: true,
    type: Number
  },
  quantityType: String,
  salePrice: {
    require: true,
    type: Number
  },
  salePriceUnit: {
    default: 'uzs',
    type: String
  },
  seller: {
    ref: 'Seller',
    type: String
  },
  storeId: {
    refPath: 'creator',
    type: Schema.Types.ObjectId
  },
  updatedAt: {
    default: Date.now(),
    type: Date
  }
});

// https://mongoosejs.com/docs/populate.html#dynamic-ref
// productsSchema.index({ name: 1 });
productsSchema.plugin(mongoosePaginate);
const Products = mongoose.model('Product', productsSchema);

module.exports = Products;