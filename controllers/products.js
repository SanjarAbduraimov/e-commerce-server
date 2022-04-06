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
    color_name,
  } = req.query;
  const { userType } = req.locale;
  let sortWhiteList = [
    'name', 'price_from', 'price_to', 'color', 'quantity_from', 'quantity_to', 'category'
  ];
  let queryList = { ...null };
  sortWhiteList.forEach((query) => {
    if (req.query[query]) {
      queryList = { ...queryList, ...getQueryItem(query, req.query) };
    }
  });
 
  function getQueryItem(queryName, query) {
    const { price_from, price_to, color, quantity_from, quantity_to, isFeatured, category } = query;

    if (queryName === 'price_from' || queryName === 'price_to') {
      return {
        salePrice: {
          $gte: +price_from || 0,
          $lte: +price_to || Number.MAX_SAFE_INTEGER,
        }
      }
    }
    if (queryName === 'quantity_from' || queryName === 'quantity_to') {
      return {
        quantity: {
          $gte: +quantity_from || 0,
          $lte: +quantity_to || Number.MAX_SAFE_INTEGER,
        }
      }
    }

    if (queryName === 'color' && color) {
      return {
        color: {
          $regex: color_name,
          $options: 'i'
        }
      }
    }

    // store id ni ob tashadim menda qo'ysam ishlamadi balki sizlarda qo'yish kerakdur
    // if(queryName === 'isFeatured' && Boolean(isFeatured)){
    //   return {
    //     isFeatured 
    //   }
    // }

    // if (queryName === 'category' && category) {
    //   return {
    //     category: category
    //   }
    // }
  }

  let queryFilter = { ...queryList };

  // const storeId = userType !== "customer" ? { storeId: userId } : {};

  console.log(queryFilter, 'queryFilter', isFeatured)

  Products.paginate( // store id ni ob tashadim menda qo'ysam ishlamadi balki sizlarda qo'yish kerakdur
    { ...queryFilter, isFeatured },
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
  const { userId, userType } = req.locale;
  const storeId =
    userType !== "customer"
      ? { storeId: userId, name: { $regex: query, $options: "i" } }
      : { name: { $regex: query, $options: "i" } };

  Products.paginate(storeId, {
    collation: collationConfig,
    sort: { name: 1 },
    page,
    populate: { path: "seller", select: "name" },
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
  const { userId, userType } = req.locale;
  const storeId =
    userType !== "customer" ? { storeId: userId, category } : { category };
  const pageSize = 10;

  Products.paginate(storeId, {
    collation: collationConfig,
    sort: { name: 1 },
    page,
    limit: pageSize,
    populate: { path: "seller", select: "name" },
    populate: { path: "category", select: "slug name uz ru" },
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
    .populate("seller", "name")
    .populate("category")
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.json({ msg: err.message, success: false }));
};

exports.fetchPublicProductsById = (req, res) => {
  const { id } = req.params;

  Products.findById(id)
    .populate("seller", "name")
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
  const { userId, userType } = req.locale;

  if (webCam) {
    imgFile = await util.webImgtoFile(
      webCam,
      "products",
      `${name}-${createdAt}`
    );
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    return res.status(400).json({ success: false, msg: "No Category with this CategoryId" });
  }

  if (category?.name?.trim() !== categoryName?.trim()) {
    return res.status(400).json({ success: false, msg: "CategoryName is not match to category's name" });
  }

  const img = req.file
    ? process.env.BACKEND_URL + req.file.path.replace("public", "")
    : imgFile || webCam;

  const { uzsValue } = Currency.findOne({ name: "usd" });

  Products.create({
    ...req.body,
    img,
    categoryName: categoryName?.trim(),
    category: categoryId,
    storeId: userId,
    uzsValue,
    seller: userType === "seller" ? userId : seller,
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
  const { webCam, oldImg, updatedAt, name, categoryName, seller } = req.body;
  const { userId } = req.locale;

  let imgFile = null;

  if (webCam) {
    imgFile = await util.webImgtoFile(
      webCam,
      "products",
      `${name}-${updatedAt}`,
      true,
      oldImg
    );
  }

  const img = req.file
    ? process.env.BACKEND_URL + req.file.path.replace("public", "")
    : imgFile || webCam || oldImg;

  const updatedData = {
    ...req.body,
    img,
    updatedAt: Date.now(),
    seller: seller ? seller : userId,
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
    const cart = await Carts.find({ "items.product": id });

    await Carts.updateMany(
      { "items.product": id },
      { $pull: { items: { product: id } } },
      { multi: true, new: true }
    );
    res.json({ payload: [], success: true });
  } catch (err) {
    res.json({ msg: err.message, success: false });
  }
};
