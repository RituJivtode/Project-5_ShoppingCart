const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');

// const { default: mongoose } = require('mongoose');
const mongoose = require("mongoose")
const validator = require('../middleware/validation')


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createOrder = async function (req, res) {

    body = req.body;
    userid = req.params.userId;

    if (!isValidObjectId(userid)) {
        return res.status(400).send({ status: false, msg: 'userid not valid' })
    }
    let checkuser = await orderModel.findOne({ userId: userid })
    if (!checkuser) {
        return res.status(404).send({ status: false, msg: "user not found" })
    }

    const { items, totalPrice, tottalItems, statusbar, totalQuantity, cancellable } = body

    let checkProduct = await productModel.findOne({ _id: $.items.productId })
    if (!checkProduct) {
        return res.status(404).send({ status: false, msg: "product not found" })
    }
    let checkCart = await cartModel.findOne({ _id: data.cartId })
    if (!checkCart) {
        return res.status(404).send({ status: false, msg: "cart not found" })
    }
    if (!items.quantity) {
        return res.status(404).send({ status: false, msg: "quantity must be present" })
    }
    if (!totalQuantity) {
        return res.status(404).send({ status: false, msg: "quantity must be present" })
    }
    if (!totalPrice) {
        return res.status(404).send({ status: false, msg: "price must be present" })
    }
    if (!tottalItems) {
        return res.status(404).send({ status: false, msg: "items must be present" })
    }

}

















































const updateOrder = async function (req, res) {
    try {
        let requestBody = req.body
        let userId = req.params.userId
        const { status, orderId } = requestBody

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "provide Valid userId" })
        }

        let userExist = await cartModel.findOne({ userId: userId })
        if (!userExist) {
            return res.status(404).send({ status: false, message: "user not found" })
        }

        
        if (object.keys(requestBody).length === 0) {
            return res.status(400).send({ status: false, message: "fill required value in body" })
        }

        if (!orderId) {
            if (!validator.isValid(orderId)) {
                return res.status(400).send({ status: false, message: "provide orderId in request body" })
            }
            if (!isValidObjectId(orderId)) {
                return res.status(400).send({ status: false, message: "provide Valid cartId in request body" })
            }

        }

        let orderPresent = await orderModel.findOne({_id:orderId})

        if(!orderPresent){
            return res.status(404).send({ status: false, message: "Order not found" })
        }

        if (!status) {
            if (!validator.isValid(status)) {
                return res.status(400).send({ status: false, message: "provide cartId in request body" })
            }
        }

        if (status == pending) {
            return res.status(400).send({ status: false, message: "status can not be pending" })
        }
        if (status == cancled) {
            if (orderPresent.cancellable === false) {
                return res.status(400).send({ status: false, message: "order Can not be cancelled" })
            }
        }


        let orderStatus = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: requestBody }, { new: true })
        let cartUpdate = await cartModel.findOneAndUpdate({ userId: userId }, { $set: { items: [], totalPrice: 0, totalItems: 0 } }, { new: true })
        res.status(200).send({ status: true, data: orderStatus })
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports.updateOrder = updateOrder
