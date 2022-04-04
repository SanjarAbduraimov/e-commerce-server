const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  createdAt: {
    default: Date.now(),
    type: Date
  },
  en: String,
  name: String,
  img: { type: String, default: '' },
  products: { type: Number, default: 0 },
  ru: String,
  slug: String,
  storeId: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  updatedAt: {
    default: Date.now(),
    type: Date
  },
  uz: String
});

const Categories = mongoose.model('Category', categorySchema);

module.exports = Categories;