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
        const { items } = data

        let userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: ` this ${userId} is invalid userId` })
        }
        let user = await userModel.findOne({ _id: userId, isDeleted: false })
        if (!user) {
            return res.status(400).send({ status: false, msg: "user  not found " })
        }

        const tokenUserId = req["userId"]
        console.log(tokenUserId)
        if (tokenUserId != user._id) {
            return res.status(403).send({ status: false, msg: " not authorized" })
        }

        if (!validator.isValid(data.productId)) {
            return res.status(400).send({ status: false, msg: 'productId must be present' })
        }
        let productId = await productModel.findOne({ _id: data.productId, isDeleted: false })
        if (!productId) {
            return res.status(404).send({ status: false, msg: 'product not found' })
        }
        console.log(productId)
            // if (!data.quantity) {
            //     return res.status(400).send({ status: false, msg: "iteams Quentity must be present more than 1" })
            // }
            // if (!validator.validInstallment(data.quantity)) {
            //     return res.status(400).send({ status: false, msg: "iteams Quentity must be valid or >= 1" })
            // }


        if (items) {
            let checkQuentity = await cartModel.findOne(items.quantity)

            console.log(checkQuentity)
            if (checkQuentity != 0) {
                let r = await cartModel.findOneAndUpdate({ $inc: { checkQuentity: 1 } })
            }

            let quantity = 1

            data.items = [{ productId: data.productId, quantity: quantity }]

            data.userId = user._id
            data.totalPrice = (productId.price) * (r)
            data.totalItems = 1;

            let addingCart = await cartModel.findOneAndUpdate({ userId: user._id }, { $push: { items: data.items }, $inc: { totalPrice: data.totalPrice, totalItems: data.totalItems } }, { new: true }).select({ "_v": 0 })

            if (addingCart) {
                return res.status(201).send({ status: true, message: "one more item added succefully", data: addingCart })
            }
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

        let userId = req.params.userId
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: ` this ${userId} is invalid userId` })
        }
        let checkUser = await cartModel.findOne({ userId: userId })
        console.log(checkUser)
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'user not found' })
        }
        res.status(200).send({ status: false, data: checkUser })
    } catch (err) {
        res.status(200).send({ status: true, data: checkUser })
    }
}




//=======================  update cart =========================================================

const cartUpdate = async function(req, res) {
    try {
        let requestBody = req.body
        let user_id = req.params.userId
        let filterQuery = {}

        if (!isValidObjectId(user_id)) {
            return res.status(400).send({ status: false, msg: ` this ${user_id} is invalid userid` })
        }
        let userExist = await cartModel.findOne({ userId: user_id })

        if (!userExist) {
            return res.status(404).send({ status: false, msg: "user not exist" })
        }

        if (Object.keys(requestBody).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }


        const { cartId, productId, removeProduct } = requestBody
        console.log(requestBody)

        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: 'cartId must be present' })
        }
        if (!isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: ` this ${cartId} is invalid cartId` })
        }

        let cartExist = await cartModel.findOne({ _id: cartId })
        if (!cartExist) {
            return res.status(404).send({ status: false, msg: "cart not exist" })
        }


        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, msg: 'productId must be present' })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: ` this ${productId} is invalid productId` })
        }
        let productExist = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productExist) {
            return res.status(404).send({ status: false, msg: "product not exist" })
        }

        //--------------------------remove produc-------------------------------------//t
        if (!validator.isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "give removeProduct value in the request body " })
        }

        if (isNaN(removeProduct)) {
            return res.status(400).send({ status: false, message: "Not a number" })
        }

        if (removeProduct < 0 || removeProduct > 1) {
            return res.status(400).send({ status: false, message: "give Valid value of the remove roduct" })
        }

        //items.splice
        //totalprice=totalprice-items[I].quqntity*product.price
        // items.splice(I,1)
        // totalitems -=1

        //---------------------need to find index at which this product lies---------------------

        for (let i = 0; i < cartExist.items.length; i++) {
            if (productId == cartExist.items[i].productId) {
                var index = i;
                if (removeProduct == 1) {
                    if (cartExist.items[index].quantity == 1) {
                        let itemsleft = cartExist.totalItems - 1
                        let priceRemain = cartExist.totalPrice - productExist.price
                        cartExist.items.splice(index, 1)
                        filterQuery = {
                            totalItems: itemsleft,
                            totalPrice: priceRemain,
                            items: cartExist.items

                        }
                    } else if (cartExist.items[index].quantity > 1) {
                        let itemsleft = cartExist.totalItems
                        let priceRemain = cartExist.totalPrice - productExist.price
                        cartExist.items[index].quantity--


                            filterQuery = {

                                totalItems: itemsleft,
                                totalPrice: priceRemain,
                                items: cartExist.items

                            }
                    }
                }

                if (removeProduct == 0) {
                    let itemsleft = cartExist.totalItems - 1
                    let priceRemain = cartExist.totalPrice - (cartExist.items[index].quantity * productExist.price)
                    cartExist.items.splice(index, 1)
                    filterQuery = {
                        totalItems: itemsleft,
                        totalPrice: priceRemain,
                        items: cartExist.items

                    }
                }
            }
        }


        let cartupdate = await cartModel.findOneAndUpdate({ _id: cartId }, { $set: filterQuery }, { new: true })
        res.status(200).send({ status: true, message: "cart updated", data: cartupdate })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

//=======================================================delete cart=====================

const deleteCart = async function(req, res) {
    try {
        let user_id = req.params.userId
            //id format validation
        if (!isValidObjectId(user_id)) {
            return res.status(400).send({ status: false, msg: `this ${user_id} is invalid userId` })
        }
        //check if the document is found with that user id 
        let checkUser = await userModel.findOne({ _id: user_id }, { isDeleted: false })
        console.log(checkUser)
        if (!checkUser) { return res.status(400).send({ status: false, msg: "user not found" }) }

        // let items = []
        let cartDeleted = await cartModel.findOneAndUpdate({ userId: user_id }, { items: [], totalItems: 0, totalPrice: 0 }, { new: true })
        res.status(200).send({ status: true, data: cartDeleted })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


module.exports = { createCart, getCart, deleteCart, cartUpdate }