const usersRouter = require("../routes/users");
const categoriesRouter = require("../routes/categories");
const productsRouter = require("../routes/products");
const authRouter = require("../routes/auth");
const cartsRouter = require("../routes/cart");
const ordersRouter = require("../routes/orders");
const favoritesRouter = require("../routes/favorites");
const errorHandling = require("../middlewares/error");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const isLoggedIn = require("../utils/index").authHandler;
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const logger = require("morgan");
const path = require("path");

module.exports = function (app, database) {
  const corsOptions = {
    credentials: true,
    origin: true,
  };
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
  app.use(express.static(path.join(__dirname, "public")));
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  // app.use(isLoggedIn);
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/categories", categoriesRouter);
  app.use("/products", productsRouter);
  app.use("/cart", cartsRouter);
  app.use("/orders", ordersRouter);
  app.use("/favorites", favoritesRouter);
  app.use(errorHandling);
};
