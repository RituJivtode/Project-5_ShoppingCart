const express = require("express");
const router = express.Router(); //used express to create route handlers

const userController = require("../controllers/userController")

router.post("/register", userController.createUser)
router.put("/user/:userId/profile", userController.updateUser)

module.exports = router;