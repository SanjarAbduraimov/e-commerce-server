const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema({
  customerId: {
    ref: 'User',
    type: Schema.Types.ObjectId
  },
  items: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: {
    default: Date.now(),
    type: Number
  },
  updatedAt: {
    default: Date.now(),
    type: Number
  }
});

// https://mongoosejs.com/docs/populate.html#dynamic-ref
const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;