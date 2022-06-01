const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const orderModel = require('../models/orderModel');
const validator = require('../middleware/validation')
const mongoose = require("mongoose")



const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const createOrder = async function (req, res) {
    try {

        body = req.body;
        userid = req.params.userId;

        if (Object.keys(body).length === 0) {
            return res.status(400).send({ status: false, msg: " sorry body can't be empty " })
        }
        const { cartId, status, cancellable } = body

        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "cart id must be present " });
        }

        let checkCart = await cartModel.findOne({ _id: cartId })
        if (!checkCart) {
            return res.status(404).send({ status: false, msg: "cart does not exist" })
        }
        let checkUserCart = await cartModel.findOne({ _id: cartId, userId: userid })
        if (!checkUserCart) {
            return res.status(404).send({ status: false, msg: "cart does not belong to that user" })
        }

        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({ status: false, message: 'Cancellable must be boolean' });
            }
        }

        if (status) {
            if (!validator.isValidStatus(status)) {
                return res.status(400).send({ status: false, message: `Status must be among ['pending','completed','cancelled'].` });
            }
        }
        if (checkUserCart.items.length == 0) {
            return res.status(202).send({ status: false, message: "cart have no items" });
        }
        if (checkCart.items.length > 0) {
            let sum = 0;
            for (let i = 0; i < checkUserCart.items.length; i++) {
                sum = + checkCart.items[i].quantity
            }

        }
 


        body.totalItems = checkUserwithCart.totalItems
        body.items = checkUserwithCart.items
        body.totalPrice = checkUserwithCart.totalPrice
        body.userId=req.params.userId

        let createOrder = await orderModel.create(body)

        let findCreatedOrder = await orderModel.findById({ _id: createOrder._id }).select({ "__v": 0 })

        return res.status(201).send({ status: true, message: "Success", data: findCreatedOrder })

    }
    catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}
 
//============================================================ update ==================================================


const updateOrder = async function (req, res) {
    try {
        let requestBody = req.body
        let userId = req.params.userId
        const { status, orderId } = requestBody

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "provide Valid userId" })
        }

        let userExist = await userModel.findOne({ _id: userId })
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

        let orderPresent = await orderModel.findOne({ _id: orderId, userId: userId, isDeleted: false })

        if (!orderPresent) {
            return res.status(404).send({ status: false, message: "Order not found " })
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


module.exports = { createOrder, updateOrder }


// if (!items.quantity) {
//     return res.status(404).send({ status: false, msg: "quantity must be present" })
// }
// if (!totalQuantity) {
//     return res.status(404).send({ status: false, msg: "quantity must be present" })
// }
// if (!totalPrice) {
//     return res.status(404).send({ status: false, msg: "price must be present" })
// }
// if (!tottalItems) {
//     return res.status(404).send({ status: false, msg: "items must be present" })
// }