const Favorites = require("../models/favourites");

exports.fetchAll = (req, res) => {
  const { id } = req.params;

  Favorites.findOne({ customerId: id })
    .populate("items")
    .then((data) => {
      res.json({ payload: data, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.create = (req, res) => {
  const { productId, userId } = req.body;
  console.log(productId, userId);

  Favorites.findOneAndUpdate(
    { customerId: userId },
    { $addToSet: { items: productId } },
    { new: true, upsert: true }
  )
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ success: false, msg: err.message }));
};

exports.deleteById = (req, res) => {
  const { productId, userId } = req.params;

  Favorites.findOneAndUpdate(
    { customerId: userId },
    { $pull: { items: productId } },
    { new: true }
  )
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ success: false, msg: err.message }));
};