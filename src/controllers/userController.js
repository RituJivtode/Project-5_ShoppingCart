const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")



const createUser = async function(req, res) {
    try {

        let body = req.body
        let files = req.files


        const { fname, lname, email, phone, password, address } = body

        body.profileImage = files

        let userCreated = await userModel.create(body)
        res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

module.exports = { createUser }