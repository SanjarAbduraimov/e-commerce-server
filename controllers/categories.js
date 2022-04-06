const Categories = require("../models/categories");

const util = require("../utils");

const collationConfig = {
  numericOrdering: true,
  locale: "en",
};

exports.fetchCategories = async (req, res) => {
  // const { userType, userId } = req.locale;
  try {
    // const query = userType === "admin" ? { storeId: userId } : {};
    const categories = await Categories.find({})
      .collation(collationConfig)
      .sort("name");
    res.json({ success: true, payload: categories });
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: err.message });
  }
};

exports.findBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const categories = await Categories.find({ slug })
      .collation(collationConfig)
      .sort("name");
    res.json({ success: true, payload: categories });
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: err.message });
  }
};

exports.findById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Categories.findById(id);
    res.json({ success: true, payload: category });
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: err.message });
  }
};

exports.addCategory = async (req, res) => {
  // const { userId } = req.locale;
  try {
    const img = req.file
      ? process.env.BACKEND_URL + req.file.path.replace("public", "")
      : "";
    const category = await Categories.create({
      ...req.body,
      img,
    });
    res.json({ success: true, payload: category });
    util.resizeImg(req.file, "category");
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: err.message });
  }
};

exports.removeCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Categories.findByIdAndDelete(id);
    res.json({ success: true, payload: category });
    util.deleteImg(category.img);
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { oldImg } = req.body;
  const { id } = req.params;
  const img = req.file
    ? process.env.BACKEND_URL + req.file.path.replace("public", "")
    : oldImg;

  const data = {
    ...req.body,
    img,
    updatedAt: Date.now(),
  };
  try {
    const categories = await Categories.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );
    res.json({ success: true, payload: categories });
    if (req.file) util.deleteImg(oldImg);
  } catch (err) {
    console.log(err);
    res.json({ success: false, msg: err.message });
  }
};