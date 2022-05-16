const Products = require("../models/products");
const Category = require("../models/categories");
const util = require("../utils");
// const Carts = require("../models/cart");

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



  Products.paginate( 
    query,
    {
      collation: collationConfig,
      page,
      limit: pageSize, 
      populate: {
        path: "category",
      },
    }
  )
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
      console.log(data)
      res.json({ data: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.search = (req, res) => {
  const { query, page = 1 } = req.params;
  console.log(query)
  // const { userId, userType } = req.locale;
  // const storeId =
  //   userType !== "customer"
  //     ? { storeId: userId, name: { $regex: query, $options: "i" } }
  //     : { name: { $regex: query, $options: "i" } };

  Products.paginate( { name: { $regex: query, $options: "i" } }, {
    collation: collationConfig,
    sort: { name: 1 },
    page,
    populate: { path: "category" },
    pagination: false,
  })
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

  Products.paginate({
    category
  },{
    collation: collationConfig,
    sort: { name: 1 },
    page,
    limit: pageSize,
    populate: { path: "category"},
  })
    .then((data) => {
      const { docs, ...pages } = data;
      res.json({ data: docs, pages, success: true });
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchProductsById = (req, res) => {
  const { id } = req.params;
  Products.findById(id)
    .populate("category")
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
  const { name, createdAt, categoryId, categoryName, } = req.body;
  let imgFile = null;

  // if (webCam) {
  //   imgFile = await util.webImgtoFile(
  //     webCam,
  //     "products",
  //     `${name}-${createdAt}`
  //   );
  // }

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(400).json({ success: false, msg: "No Category with this CategoryId" });
  }

  // if (category?.name?.trim() !== categoryName?.trim()) {
  //   return res.status(400).json({ success: false, msg: "CategoryName is not match to category's name" });
  // }

  const img = req.file
    ? process.env.BACKEND_URL + req.file.path.replace("public", "")
    : imgFile;

  // const { uzsValue } = Currency.findOne({ name: "usd" });

  Products.create({
    ...req.body,
    img,
    category: categoryId,
  })
    .then((data) => {
      res.json({ success: true, payload: data, msg: "product_created" });
      util.resizeImg(req.file, "product");
    })
    .catch((err) => {
      res.json({ success: false, msg: err.message });
    });
};

exports.updateProductsById = async (req, res) => {
  const { id } = req.params;
  const { oldImg, updatedAt, name, categoryName, } = req.body;
  // const { userId } = req.locale;

  let imgFile = null;

  // if (webCam) {
  //   imgFile = await util.webImgtoFile(
  //     webCam,
  //     "products",
  //     `${name}-${updatedAt}`,
  //     true,
  //     oldImg
  //   );
  // }

  const img = req.file
    ? process.env.BACKEND_URL + req.file.path.replace("public", "")
    : imgFile || oldImg;

  const updatedData = {
    ...req.body,
    img,
    updatedAt: Date.now(),
  };

  Products.findByIdAndUpdate(id, { $set: updatedData }, { new: true })
    .then((data) => {
      res.json({
        success: true,
        payload: data,
        msg: "product_updated",
      });

      if (img.startsWith("data:image/jpeg;base64")) {
        util.deleteImg(oldImg);
      } else {
        util.resizeImg(req.file, "product");
      }
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
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
