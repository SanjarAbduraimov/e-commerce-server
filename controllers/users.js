const bcrypt = require("bcrypt");
const Users = require("../models/users");
const util = require("../utils");

exports.fetchAllUsers = (req, res) => {
  Users.find()
    .then((users) => res.json(users))
    .catch((err) => res.send(err));
};

exports.fetchUserById = (req, res) => {
  const { id } = req.params;

  Users.findById(id)
    .then((admin) => {
      res.json(admin);
    })
    .catch((err) => res.send(err));
};

exports.deleteAllUsers = (req, res) => {
  Users.deleteMany()
    .then(() => res.json("Deleted"))
    .catch((err) => res.send(err));
};

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  // let imgFile = null;

  // const img = file ? baseUrl + file.path.replace("public", "") : imgFile;
  const hashedPassword = await bcrypt.hash(password, 8);
  const User = new Users({
    ...req.body,
    password: hashedPassword,
  });
  User.save()
    .then((data) => {
      res.json({ data, success: true });
      // util.resizeImg(file, "users");
    })
    .catch((err) => {
      const msg =
        err.code === 11000
          ? `Users with "${email}" email adress exists`
          : err.errmsg;
      res.json({ success: false, msg });
      console.log(msg);
    });
};

exports.updateUserById = async (req, res) => {
  const { id } = req.params;
  const { oldImg, password, name } = req.body;

  let imgFile = null;

  const img = req.file
    ? baseUrl + req.file.path.replace("public", "")
    : imgFile || oldImg;
  const hashedPassword = await bcrypt.hash(password, 8);

  const updatedData = { ...req.body, img, password: hashedPassword };

  Users.findByIdAndUpdate(id, { $set: updatedData }, { new: true })
    .then((admin) => {
      res.json(admin);
      util.resizeImg(req.file, "admins");
    })
    .catch((err) => res.send(err));
};

exports.changeUserAuth = async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;
  console.log(req.body);

  const hash = await bcrypt.hash(password, 8);
  Users.find({ email })
    .then((admin) => {
      console.log(admin);

      if ((admin.length && admin[0]._id == id) || !admin.length) {
        console.log("Success");

        Users.findByIdAndUpdate(
          id,
          { $set: { email, password: hash } },
          { new: true }
        )
          .then(() => res.json({ success: true }))
          .catch((err) => res.json({ success: false, msg: err.message }));
      } else if (admin.length && admin[0]._id != id) {
        res.json({
          success: false,
          msg: `You can't use the email. Another user has been registered with '${email}'`,
        });
      }
    })
    .catch((err) => res.json({ success: false, msg: err.message }));
};

exports.deleteUserById = (req, res) => {
  const { id } = req.params;
  Users.findByIdAndRemove(id)
    .then(() => {
      res.json({ success: true, msg: "Successfully deleted" });
    })
    .catch((err) => res.send(err));
};
