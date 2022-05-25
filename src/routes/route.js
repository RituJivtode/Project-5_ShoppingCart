const express = require("express");
const router = express.Router(); //used express to create route handlers

const userController = require("../controllers/userController")
const mid = require("../middleware/authe")

router.post("/register", userController.createUser)
router.post("/login", userController.login)

router.put("/user/:userId/profile",mid.authentication,mid.authorization1 ,userController.updateUser)

module.exports = router;