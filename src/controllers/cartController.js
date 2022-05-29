const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
// const { default: mongoose } = require('mongoose');
const mongoose = require("mongoose")
const validator = require('../middleware/validation')


const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createCart = async function(req, res) {
    try {
        let data = req.body
        let userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: ` this ${userId} is invalid userId` })
        }
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            return res.status(400).send({ status: false, msg: "user id not found " })
        }

        const tokenUserId = req["userId"]
        console.log(tokenUserId)
        if (tokenUserId != user._id) {
            return res.status(403).send({ status: false, msg: " not authorized" })
        }

        if (!data.productId) {
            return res.status(400).send({ status: false, msg: 'productId must be present' })
        }
        let productId = await productModel.findOne({ _id: data.productId, isDeleted: false })
        if (!productId) {
            return res.status(400).send({ status: false, msg: 'product not found' })
        }

        if (!data.quantity) {
            return res.status(400).send({ status: false, msg: "iteams Quentity must be present more than 1" })
        }
        if (!validator.validInstallment(data.quantity)) {
            return res.status(400).send({ status: false, msg: "iteams Quentity must be valid or >= 1" })
        }

        data.items = [{ productId: data.productId, quantity: data.quantity }]

        data.userId = user._id
        data.totalPrice = (productId.price) * (data.quantity)
        data.totalItems = 1;
        let addingCart = await cartModel.findOneAndUpdate({ userId: user._id }, { $push: { items: data.items }, $inc: { totalPrice: data.totalPrice, totalItems: data.totalItems } }, { new: true }).select({ "_v": 0 })

        if (addingCart) {
            return res.status(201).send({ status: true, message: "one more item added succefully", data: addingCart })
        }
        let cartCreate = await cartModel.create(data)
        res.status(201).send({ status: true, data: cartCreate })
    } catch (err) {
        res.status(500).send({ status: true, msg: err.message })
    }

}

//========================================================get cart======================***

const getCart = async function(req, res) {
    try {
        userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: ` this ${userId} is invalid userId` })
        }
        let checkUser = await cartModel.findOne({ userId: userId })
        console.log(checkUser)
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'user not found' })
        }
        res.status(200).send({ status: true, data: checkUser })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

//=======================================================delete cart=====================

const deleteCart = async function(req, res) {
    try {
        userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: `this ${userId} is invalid userId` })
        }
        //check if the document is found with that user id 
        let checkUser = await cartModel.findOne({userId: userId})
        if (!checkUser) {
             return res.status(400).send({ status: false, msg: "user not found" }) 
            }
        const items = [];
        let cartDeleted = await cartModel.findOneAndUpdate({ _id:checkUser._id  }, { $set: { items: items, totalItems: 0, totalPrice: 0 } }, { new: true })
        res.status(204).send({ status: true, data: cartDeleted })
    } 
    catch {
        res.status(500).send({ status: false, msg: err.message })
  
    }
}


module.exports.createCart 
module.exports.getCart
module.exports.deleteCart