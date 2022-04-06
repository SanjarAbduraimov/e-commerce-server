const Carts = require("../models/cart");

exports.fetchCartById = (req, res) => {
  const { id } = req.params;
  Carts.findById(id)
    .populate({ path: "items.product" })
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchAllCarts = (req, res) => {
  Carts.find()
    .populate({ path: "items.product" })
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.addToCartById = (req, res) => {
  const { product, qty, total } = req.body;
  const _id = req.params.id

  Carts.findById(_id)
    .populate({ path: "items.product" })
    .then((doc) => {
      if (doc) {
        const { items } = doc;

        const isNew = items.find((item) => item.product?._id == product);

        if (!isNew) {
          Carts.findByIdAndUpdate(
            _id,
            { $addToSet: { items: req.body } },
            { new: true }
          )
            .populate({ path: "items.product" })
            .then((data) => {
              res.json({ success: true, payload: data });
            })
            .catch((err) => res.json({ success: false, msg: err.message }));
        } else {
          const updatedData = items.map((item) => {
            if (item.product._id == product) {
              item.qty += qty;
              item.total += total;
            }
            return item;
          });

          Carts.findByIdAndUpdate(
            _id,
            { $set: { items: updatedData } },
            { new: true }
          )
            .populate({ path: "items.product" })
            .then((data) => res.json({ success: true, payload: data }))
            .catch((err) => res.json({ success: false, msg: err.message }));
        }
      } else {
        Carts.findByIdAndUpdate(
          _id,
          { $addToSet: { items: req.body } },
          { new: true, upsert: true }
        )
          .populate({ path: "items.product" })
          .then((data) => {
            res.json({ success: true, payload: data });
          })
          .catch((err) => res.json({ msg: err.message, success: false }));
      }
    });
};

exports.clearCart = (req, res) => {
  const { id } = req.params;
  Carts.findByIdAndUpdate(id, { items: [], total: 0, qty: 0 }, { new: true })
    .then((data) => res.json({ success: true, payload: data }))
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.removeItem = (req, res) => {
  const { items, id } = req.body;
  Carts.findByIdAndUpdate(id, { $set: { items } }, { new: true })
    .populate({ path: "items.product" })
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ success: false, msg: err.message }));
};