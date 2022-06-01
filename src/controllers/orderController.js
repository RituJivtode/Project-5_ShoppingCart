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

    // body = req.body;
    // userid = req.params.userId;

    // if (!isValidObjectId(userid)) {
    //     return res.status(400).send({ status: false, msg: 'userid not valid' })
    // }
    // let checkuser = await userModel.findOne({ _id: userid })
    // if (!checkuser) {
    //     return res.status(404).send({ status: false, msg: "user not found" })
    // }

    // const { items, status, cancellable } = body

    // // let checkProduct = await productModel.findOne({ _id: $.items.productId })
    // // if (!checkProduct) {
    // //     return res.status(404).send({ status: false, msg: "product not found" })
    // // }
    // let checkCart = await cartModel.findOne({ userId:userid })
    // if (!checkCart) {
    //     return res.status(404).send({ status: false, msg: "cart does not belong to that user" })
    // }
    // if (cancellable) {
    //     if (typeof cancellable != "boolean") {
    //         return res.status(400).send({ status: false, message: 'Cancellable must be boolean' });
    //     }
    // }

    // if (status) {
    //     if (!validator.isValidStatus(status)) {
    //         return res.status(400).send({ status: false, message: `Status must be among ['pending','completed','cancelled'].` });
    //     }
    // }
    // // if (!checkCart.items.length) {
    // //     return res.status(202).send({ status: false, message: `Order already placed Please add some products in cart to make an order.` });
    // // }                         
    // //adding quantity of every products
    // const reducer = (previousValue, currentValue) => previousValue + currentValue;
    // let totalQuantity = checkCart.items.map((x) => x.quantity).reduce(reducer);

    // const orderDetails = {
    //     userId: userId,
    //     items: checkCart.items,
    //     totalPrice: checkCart.totalPrice,
    //     totalItems: checkCart.totalItems,
    //     totalQuantity: totalQuantity,
    //     cancellable,
    //     status,
    // };
    // const savedOrder = await orderModel.create(orderDetails);

    // //Empty the cart after the successfull order
    // await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, {
    //     $set: {
    //         items: [],
    //         totalPrice: 0,
    //         totalItems: 0,
    //     },
    // });
    // return res.status(200).send({ status: true, message: "Order placed.", data: savedOrder });



    try {
        const userId = req.params.userId;
        const requestBody = req.body;

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request body. Please provide the the input to proceed." });
        }
        //Extract parameters
        const { cartId, cancellable, status } = requestBody;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Invalid userId in params." });
        }

        const searchUser = await userModel.findOne({ _id: userId });
        if (!searchUser) {
            return res.status(400).send({ status: false, message: `user doesn't exists for ${userId}` });
        }

        if (!cartId) {
            return res.status(400).send({ status: false, message: `Cart doesn't exists for ${userId}` });
        }
        if (! isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `Invalid cartId in request body.` });
        }
        const searchCartDetails = await cartModel.findOne({ _id: cartId, userId: userId });

        if (!searchCartDetails) {
            return res.status(400).send({ status: false, message: `Cart doesn't belongs to ${userId}` });
        }

        if (cancellable) {
            if (typeof cancellable != "boolean") {
                return res.status(400).send({ status: false, message: `Cancellable must be either 'true' or 'false'.` });
            }
        }

        if (status) {
            if (!validator.isValidStatus(status)) {
                return res.status(400).send({ status: false, message: `Status must be among ['pending','completed','cancelled'].` });
            }
        }
        // if (!searchCartDetails.items.length) {
        //     return res.status(202).send({ status: false, message: `Order already placed for this cart. Please add some products in cart to make an order.` });
        // }
        //adding quantity of every products
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        let totalQuantity = searchCartDetails.items.map((x) => x.quantity).reduce(reducer);

        const orderDetails = {
            userId: userId,
            items: searchCartDetails.items,
            totalPrice: searchCartDetails.totalPrice,
            totalItems: searchCartDetails.totalItems,
            totalQuantity: totalQuantity,
            cancellable,
            status,
        };
        const savedOrder = await orderModel.create(orderDetails);

        //Empty the cart after the successfull order
        await cartModel.findOneAndUpdate({ _id: cartId, userId: userId }, {
            $set: {
                items: [],
                totalPrice: 0,
                totalItems: 0,
            },
        });
        return res.status(200).send({ status: true, message: "Order placed.", data: savedOrder });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
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

        let orderPresent = await orderModel.findOne({_id:orderId, userId:userId, isDeleted:false})

        if(!orderPresent){
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


module.exports  = { createOrder, updateOrder}


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