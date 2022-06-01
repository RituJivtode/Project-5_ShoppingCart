const cartModel = require('../models/cartModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
// const { default: mongoose } = require('mongoose');
const mongoose = require("mongoose")
const validator = require('../middleware/validation')


const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
 
let digitRegex = /^[1-9]{1}[0-9]{0,10000}$/

let removeProductRegex = /^[0-1]{1}$/


//------------------------------------------------------validations ends here------------------------------------------------------//


const createCart = async (req, res) => {
    try {

        const data = req.body
        const userIdbyParams = req.params.userId

        let { productId, quantity, cartId } = data

        if (Object.keys(data).length === 0) {
            return res.status(400).send({ status: false, messsage: "Please enter some data" })
        }

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, messsage: "plzz enter valid productId" })
        }

        const isProductPresent = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!isProductPresent) {
            return res.status(404).send({ status: false, messsage: `product not found by this prodct id ${productId}` })
        }
        if(quantity === ""){
            return res.status(400).send({ status: false, messsage: "plzz enter valid quatity , please use digit" })
        }
        if(!quantity){
             quantity=1
        }
        if (quantity) {
            if (!digitRegex.test(quantity)) {
                return res.status(400).send({ status: false, messsage: "plzz enter valid quatity" })
            }
        }

       
        if (typeof quantity === "string") {
            return res.status(400).send({ status: false, messsage: "plzz enter quantity in Number not as an including string" })
        }

        data.userId = userIdbyParams

        data.items = [{ productId: isProductPresent._id, quantity: quantity }]

        data.totalPrice = (isProductPresent.price) * quantity

        data.totalItems = data.items.length

      
        //----------------------------------------------------------------------------------------------------------//

        let addingCart = await cartModel.findOneAndUpdate({ userId: userIdbyParams }, { $push: { items: data.items }, $inc: { totalPrice: data.totalPrice, totalItems: data.totalItems } }, { new: true }).select({ "__v": 0 })

        if (addingCart) {
            return res.status(201).send({ status: true, message: "one more item added succefully", data: addingCart })
        }

        //-------------------let's create a cart  ---------------------------------------------------------//

        let createCart = await cartModel.create(data)
        return res.status(201).send({ status: true, message: "cart  created successfullly", data: createCart })

        //------------this line is being use to remove _V:0   ---------------------------------------------//

        // let findData = await cartModel.findOne({ _id: createCart._id }).select({ "__v": 0 })

        // return res.status(201).send({ status: true, message: "cart added", data: findData })

    } catch (err) {
        return res.status(500).send({ Status: false, message: err.message })
    }
}

//========================================================get cart======================***

const getCart = async function (req, res) {
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
    }
    catch (err) {
        res.status(200).send({ status: true, data: checkUser })
    }
}




//=======================  update cart =========================================================

const cartUpdate = async function (req, res) {
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
                    }
                    else if (cartExist.items[index].quantity > 1) {
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

const deleteCart = async function (req, res) {
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

        let checkId = await cartModel({ userId: user_id })
        if (!checkId) {
            return res.status(400).send({ status: false, msg: "user does not exist" })
        }

        let cartDeleted = await cartModel.findOneAndUpdate({ userId: user_id }, { $set: { items: [], totalItems: 0, totalPrice: 0 } }, { new: true }).select({ items: 1, totalPrice: 1, totalItems: 1, _id: 0 });

        console.log(cartDeleted)
        res.status(204).send({ status: true, msg: "cart data successfully deleted", data: cartDeleted })

        // let items = []
        // let cartDeleted = await cartModel.findOneAndUpdate({ userId: user_id }, { items: items, totalItems: 0, totalPrice: 0 }, { new: true })
        // res.status(200).send({ status: true, data: cartDeleted })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports = { createCart, getCart, deleteCart, cartUpdate }