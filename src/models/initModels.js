const Users = require("./users.models");
const Products = require("./products.models");
const ProductInOrder = require("./productInOrder.models");
const ProductInCart = require("./productInCart.models");
const Order = require("./order.models");
const Cart = require("./cart.models");

const initModels = () => {

  // user = order
  Users.hasMany(Order, { foreignKey: "user_id" });
  Order.belongsTo(Users, { foreignKey: "user_id" });

  //User = 1 car
  Users.hasOne(Cart, { foreignKey: "user_id" });
  Cart.belongsTo(Users, { foreignKey: "user_id" });

  //User = products
  Users.hasMany(Products, { foreignKey: "user_id" });
  Products.belongsTo(Users, { foreignKey: "user_id" });

  //Product = products in car
  Products.hasMany(ProductInCart, { foreignKey: "product_id" });
  ProductInCart.belongsTo(Products, { foreignKey: "product_id" });

  //Products = products in order
  Products.hasMany(ProductInOrder, { foreignKey: "product_id" });
  ProductInOrder.belongsTo(Products, { foreignKey: "product_id" });

  //car = products in car
  Cart.hasMany(ProductInCart, { foreignKey: "cart_id", onDelete: 'cascade' });
  ProductInCart.belongsTo(Cart, { foreignKey: "cart_id" });

  //Order = products in order
  Order.hasMany(ProductInOrder, { foreignKey: "order_id" });
  ProductInOrder.belongsTo(Order, { foreignKey: "order_id" });

};

module.exports = initModels;