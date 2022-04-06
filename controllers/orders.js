const Carts = require("../models/cart");
const Orders = require("../models/orders");
const Products = require("../models/products");

exports.fetchById = (req, res) => {
  const { id } = req.params;
  Orders.findById(id)
    .populate({ path: "customerId", select: "name img email phone" })
    .populate({ path: "items.product" })
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.search = (req, res) => {
  const { query, page = 1 } = req.params;
  const pageSize = 10;

  Orders.paginate(
    { name: { $regex: query, $options: "i" } },
    {
      sort: { updatedAt: -1 },
      page,
      limit: pageSize,
    }
  )
    .then((data) => {
      const { docs, ...pages } = data;
      res.json({ payload: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchAll = (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 10;

  Orders.paginate({}, {
    page,
    limit: pageSize,
    sort: { createdAt: -1 },
    populate: { path: "customerId", select: "name img email phone" },
  })
    .then((data) => {
      const { docs, ...pages } = data;
      res.json({ data: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.create = (req, res) => {
  const { customer, cartId: userId } = req.body;

  const orders = {
    ...req.body,
    customerId: userId,
    status: "pending",
    contact: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
    shipping: {
      address: customer.address,
      city: customer.city,
      zip: customer.zip,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  Orders.create(orders)
    .then(async (data) => {
      await Carts.findByIdAndUpdate(
        userId,
        { total: 0, qty: 0, items: [], updatedAt: Date.now() },
        { new: true }
      );
      res.json({ success: true, payload: data });

      data.items.forEach(async (i) => {
        try {
          const product = await Products.findById(i.product);
          await Products.findByIdAndUpdate(
            i.product,
            { $set: { quantity: product.quantity - i.qty } },
            { new: true }
          );
        } catch (err) {
          console.log("UPDATING product quantity", err);
        }
      });
      const orders = await Orders.find({ status: "pending" }).count();
      App.io.emit("/orders/new", { success: true, orders });
    })
    .catch((err) => res.json({ success: false, msg: err.message }));
};

exports.deleteById = (req, res) => {
  const { id } = req.params;

  Orders.findByIdAndDelete(id)
    .then((data) => {
      res.json({ success: true, payload: data });
    })
    .catch((err) => res.json({ success: false, msg: err.message }));
};

exports.changeStatusById = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === "completed") {
    Orders.findByIdAndDelete(id)
      .then(async (data) => {
        const { _id, ...sale } = data._doc;
        if (data.status === "canceled") {
          data.items.forEach(async (i) => {
            try {
              const product = await Products.findById(i.product);
              await Products.findByIdAndUpdate(
                i.product,
                { $set: { quantity: product.quantity - i.qty } },
                { new: true }
              );
            } catch (err) {
              console.log("UPDATING product quantity", err);
            }
          });
        }
      })
      .then(async (sale) => {
        res.json({ success: true, payload: sale });
      })
      .catch((err) => {
        res.json({ success: false, msg: err.message });
      });
  } else {
    Orders.findByIdAndUpdate(id, { status })
      .then(async (data) => {
        res.json({ success: true, payload: data });
        data.items.forEach(async (i) => {
          try {
            const product = await Products.findById(i.product);
            await Products.findByIdAndUpdate(
              i.product,
              { $set: { quantity: product.quantity + i.qty } },
              { new: true }
            );
          } catch (err) {
            console.log("UPDATING product quantity", err);
          }
        });
      })
      .catch((err) => res.json({ success: false, msg: err.message }));
  }
};

// =================== MOBILE ======================
exports.fetchByCustomerId = (req, res) => {
  const { id } = req.params;
  console.log(id);

  Orders.find({ customerId: id })
    .sort({ createdAt: -1 })
    .populate({ path: "customerId", select: "name img email phone" })
    .then((data) => {
      console.log(data);

      res.json({ payload: data, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};
