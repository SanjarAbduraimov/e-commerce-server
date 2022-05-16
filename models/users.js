const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new Schema(
  {
    address: String,
    email: {
      required: true,
      type: String,
      unique: true,
    },
    city: String, 
    img: {
      default: '',
      type: String
    },
    type: {
      default: "user",
      type: String,
    },
    name: String,
    lastName: String,
    password: {
      required: true,
      type: String,
    },
    phone: {
      type: String,
      unique: true
    },
    zip: { type: String, default: '' },
    active: { type: Boolean, default: false },
    role: {
      default: "user",
      type: String,
      enum: ["user", "admin"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(mongoosePaginate);

userSchema.index({ email: 1 });
const User = mongoose.model("User", userSchema);

module.exports = User;
