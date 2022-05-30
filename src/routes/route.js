const express = require("express");
const router = express.Router(); //used express to create route handlers
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")

const mid = require("../middleware/authe")
//=============================user==========================================

router.post("/register", userController.createUser)

router.post("/login", userController.login)

router.get("/user/:userId/profile", mid.authentication, userController.getUser)

router.put("/user/:userId/profile", mid.authentication, mid.authorization, userController.updateUser)

router.put("/user/:userId/profile", userController.updateUser)

//==============================================product====================================
router.get("/products", productController.productByQuery)

router.get("/products/:productId", productController.getProduct)

router.post("/products", productController.createProduct)

router.put("/products/:productId", productController.updateProduct)

router.delete("/products/:productId", productController.deleteProduct)

//==========================================cart===============================================

router.post("/users/:userId/cart", mid.authentication, cartController.createCart)

router.get("/users/:userId/cart", mid.authentication, cartController.getCart)
router.put("users/:userId/cart", cartController.cartUpdate)

router.delete("/users/:userId/cart", mid.authentication, cartController.deleteCart)

module.exports = router;