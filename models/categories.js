const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  createdAt: {
    default: Date.now(),
    type: Date,
  },
  en: String,
  name: String,
  img: { type: Schema.Types.ObjectId, ref: "File" },
  products: { type: Number, default: 0 },
  ru: String,
  updatedAt: {
    default: Date.now(),
    type: Date,
  },
  uz: String,
});

const Categories = mongoose.model("Category", categorySchema);

module.exports = Categories;
