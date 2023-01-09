const Products = require("../models/products");
const Category = require("../models/categories");
const util = require("../utils");

// const Carts = req{uire("../models/cart");
const collationConfig = {
  numericOrdering: true,
  locale: "en",
};

exports.fetchAllProducts = (req, res) => {
  const {
    page = 1,
    pageSize = 10,
    category,
    price_from = 0,
    price_to,
    quantity_from = 0,
    quantity_to,
    color,
  } = req.query;
  let query = {};

  if (category) {
    query.category = category;
  }
  if (Number(price_from)) {
    query.salePrice = { $gte: Number(price_from) };
  }
  if (Number(price_to)) {
    query.salePrice = { $lte: Number(price_to) };
  }
  if (Number(quantity_from)) {
    query.quantity = { $gte: Number(quantity_from) };
  }
  if (Number(quantity_to)) {
    query.quantity = { $lte: Number(quantity_to) };
  }
  if (color) {
    query.color = color;
  }
  if (Number(price_from) && Number(price_to)) {
    query.salePrice = { $gte: Number(price_from), $lte: Number(price_to) };
  }
  if (Number(quantity_from) && Number(quantity_to)) {
    query.quantity = { $gte: Number(quantity_from), $lte: Number(quantity_to) };
  }
  // if (userType !== "customer") {
  //   query.storeId = userId;
  // }

  // const storeId = userType !== "customer" ? { storeId: userId } : {};

  Products.paginate(query, {
    collation: collationConfig,
    page,
    limit: pageSize,
    populate: [
      {
        path: "category",
      },
    ],
  })
    .then((data) => {
      const { docs, ...pages } = data;
      res.json({ data: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchPublicProducts = (req, res) => {
  const { page = 1 } = req.query;
  const pageSize = 10;
  Products.paginate(
    {},
    {
      collation: collationConfig,
      sort: { name: 1 },
      page,
      limit: pageSize,
      projection: {
        price: 0,
        priceUnit: 0,
        createdAt: 0,
      },
      populate: { path: "category" },
    }
  )
    .then((data) => {
      const { docs, ...pages } = data;
      console.log(data);
      res.json({ data: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.search = (req, res) => {
  const { query, page = 1 } = req.params;
  console.log(query);
  // const { userId, userType } = req.locale;
  // const storeId =
  //   userType !== "customer"
  //     ? { storeId: userId, name: { $regex: query, $options: "i" } }
  //     : { name: { $regex: query, $options: "i" } };

  Products.paginate(
    { name: { $regex: query, $options: "i" } },
    {
      collation: collationConfig,
      sort: { name: 1 },
      page,
      populate: { path: "category" },
      pagination: false,
    }
  )
    .then((data) => {
      const { docs, ...pages } = data;
      res.json({ payload: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchAllProductsByCategory = (req, res) => {
  const { page = 1, category } = req.params;
  // const { userId, userType } = req.locale;
  // const storeId =
  //   userType !== "customer" ? { storeId: userId, category } : { category };
  const pageSize = 10;

  Products.paginate(
    {
      category,
    },
    {
      collation: collationConfig,
      sort: { name: 1 },
      page,
      limit: pageSize,
      populate: { path: "category" },
    }
  )
    .then((data) => {
      const { docs, ...pages } = data;
      res.json({ data: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchProductsById = (req, res) => {
  const { id } = req.params;
  Products.findById(id)
    .populate("category", "img")
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.deleteAllProducts = (req, res) => {
  Products.deleteMany()
    .then(() => res.json("Deleted"))
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.createNewProducts = async (req, res) => {
  const { name, createdAt, categoryId, categoryName } = req.body;
  const category = await Category.findById(categoryId);
  if (!category)
    return res
      .status(404)
      .json({ success: false, msg: "Category is not found" });
  Products.create({
    ...req.body,
    img: req.file.id,
    category: categoryId,
  })
    .then((data) => {
      res.json({ success: true, payload: data, msg: "product_created" });
    })
    .catch((err) => {
      res.json({ success: false, msg: err.message });
    });
};

exports.updateProductsById = async (req, res) => {
  const { id } = req.params;
  const { oldImg } = req.body;
  let imgFile = null;

  // const img = req.file
  //   ? process.env.BACKEND_URL + req.file.path.replace("public", "")
  //   : imgFile || oldImg;

  const updatedData = {
    ...req.body,
    updatedAt: Date.now(),
  };

  const product = await Products.findByIdAndUpdate(
    id,
    { $set: updatedData },
    { new: true }
  );
  // if (oldImg) {
  //   // util.deleteImg(oldImg);
  // } else {
  //   // util.resizeImg(req.file, "product");
  // }
  res.json({
    success: true,
    payload: product,
    msg: "product_updated",
  });
};

exports.deleteProductsById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedItem = await Products.findByIdAndRemove(id);
    util.deleteImg(deletedItem.img);
    // const cart = await Carts.find({ "items.product": id });

    // await Carts.updateMany(
    //   { "items.product": id },
    //   { $pull: { items: { product: id } } },
    //   { multi: true, new: true }
    // );
    res.json({ payload: [], success: true });
  } catch (err) {
    res.json({ msg: err.message, success: false });
  }
};
