const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const productsSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
  categoryName: {
    type: String,
    require: true,
  },
  color: String,
  createdAt: {
    default: Date.now(),
    type: Date,
  },
  creator: {
    type: String,
  },
  description: String,
  img: { type: Schema.Types.ObjectId },
  name: String,
  price: {
    require: true,
    type: Number,
  },
  brand: String,
  quantity: {
    require: true,
    type: Number,
  },
  quantityType: String,
  salePrice: {
    require: true,
    type: Number,
  },
  hasDiscount: {
    default: false,
    type: Boolean,
  },
  tags: [String],
  discount: Number,
  size: String,
  updatedAt: {
    default: Date.now(),
    type: Date,
  },
});

// https://mongoosejs.com/docs/populate.html#dynamic-ref
productsSchema.index({ name: 1 });
productsSchema.plugin(mongoosePaginate);
const Products = mongoose.model("Product", productsSchema);

module.exports = Products;
