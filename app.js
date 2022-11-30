const express = require("express");
const path = require("path");
const logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const MongoStore = require("connect-mongo")(session);
const compression = require("compression");
const isLoggedIn = require("./utils/index").authHandler;
const dotenv = require("dotenv");
const port = process.env.PORT || 9999;

const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const authRouter = require("./routes/auth");
const cartsRouter = require("./routes/cart");
const ordersRouter = require("./routes/orders");
const favoritesRouter = require("./routes/favorites");

const app = express();

dotenv.config({ path: path.resolve(__dirname, "./.env") });
const database = process.env.DB_URI || "mongodb://localhost/server-students-db";
const corsOptions = {
  credentials: true,
  origin: true,
};
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());
app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const store = new MongoStore({
  url: database,
  autoRemove: "interval",
  autoRemoveInterval: 1,
});
app.use(
  session({
    secret: "mahfiy kalitni topa olmaysiz",
    resave: false,
    saveUninitialized: true,
    store,
  })
);

app.use(isLoggedIn);
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);
app.use("/cart", cartsRouter);
app.use("/orders", ordersRouter);
app.use("/favorites", favoritesRouter);

mongoose
  .connect(database, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log("Database loaded successfully");
  })
  .catch((err) => console.log(err));

app.listen(port, () =>
  console.log(`App is running on server localhost: ${port}`)
);
module.exports = app;
