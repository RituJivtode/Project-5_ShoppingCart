const express = require("express");
const router = express.Router(); //used express to create route handlers
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")

const mid = require("../middleware/authe")


//=============User===========================

router.post("/register", userController.createUser)

router.post("/login", userController.login)

router.get("/user/:userId/profile", mid.authentication, userController.getUser)

<<<<<<< HEAD
router.put("/user/:userId/profile", mid.authentication, mid.authorization, userController.updateUser)
=======
router.put("/user/:userId/profile", userController.updateUser)
//=====================Product=========================
>>>>>>> dd9ce2e9c5656a92d3c8cda8132f6ea93d49546c

//=====================Product=========================

router.get("/products", productController.productByQuery)

router.get("/products/:productId", productController.getProduct)

router.post("/products", productController.createProduct)

router.put("/products/:productId", productController.updateProduct)

router.delete("/products/:productId", productController.deleteProduct)

//===========================Cart=============================================

router.post("/users/:userId/cart", mid.authentication,cartController.createCart)




module.exports = router;