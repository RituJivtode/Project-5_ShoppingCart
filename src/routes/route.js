const express = require("express");
const router = express.Router(); //used express to create route handlers
const middleware = require('../middleware/authe')

const userController = require("../controllers/userController")

router.post("/register", userController.createUser)
router.post("/login", userController.login)

router.put("/user/:userId/profile", userController.updateUser)
router.get("/user/:userId/profile",middleware.authentication, userController.getUser)



module.exports = router;