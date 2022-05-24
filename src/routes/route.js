const express = require("express");
const router = express.Router(); //used express to create route handlers

const userController = require("../controllers/userController")

router.post("/register", userController.createUser)


module.exports = router;