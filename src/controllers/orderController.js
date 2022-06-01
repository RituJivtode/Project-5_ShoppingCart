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

   if(!isValidObjectId(userid)){
       return res.status(400).send({status:false,msg:'userid not valid'})
   }
   let checkuser = await orderModel.findOne({userId:userid})
   if(!checkuser){
       return res.status(404).send({status:false, msg:"user not found"})
   }

   const {items,totalPrice,tottalItems,statusbar,totalQuantity,cancellable} =body

   let checkProduct = await productModel.findOne({_id:$.items.productId})
   if(!checkProduct){
       return res.status(404).send({status:false, msg:"product not found"})
   }
   let checkCart = await cartModel.findOne({_id:data.cartId})
   if(!checkCart){
       return res.status(404).send({status:false, msg:"cart not found"})
   }
   if(!items.quantity){
    return res.status(404).send({status:false, msg:"quantity must be present"})
}
if(!totalQuantity){
    return res.status(404).send({status:false, msg:"quantity must be present"})
}
if(!totalPrice){
    return res.status(404).send({status:false, msg:"price must be present"})
}
if(!tottalItems){
    return res.status(404).send({status:false, msg:"items must be present"})
}

}