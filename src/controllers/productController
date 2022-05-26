const aws = require('aws-sdk')
const { AppConfig } = require('aws-sdk');
const validator = require("../middleware/validation")
const mongoose = require('mongoose')
const productModel = require('../models/productModel')

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//=============================================================================


const productByQuery = async function (req, res) {
    try {
        // from Query to QuryParams
        const queryParams = req.query

    // Existence of product=====
        let productExist = await productModel.find({queryParams, isDeleted: false })
        if (productExist.length == 0) {
            return res.status(404).send({ status: false, message: "there is no product" })
        }
        // sort by price in product collection.==========
        const products = await productModel.find({ $and: [queryParams, {isDeleted: false }] }).sort({price:1})
         res.status(200).send({ status: true, data: products });


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    } 

}

//===============================  Get Poduct By Id============================


const getProduct = async function (req, res) {
    try {
        //userid from path=======
        const product_id = req.params.productId;

        //id validation====
        if (product_id) {
        if (!isValidObjectId(product_id)) {
    return res.status(400).send({ status: false, message: "Invalid productId" });
            }
        }

        const product = await productModel.findOne({ _id: product_id, isDeleted:false })
        // product not found===
        if (!product) {
            return res.status(404).send({ status: false, message: "Product not found" });
        }
        //return product in response==
        return res.status(200).send({ status: true, data: product});


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    } 

}
// ==============================================================================================================
const updateProduct = async function(req, res) {
    try {

        let product_id = req.params.userId

        //id format validation
        if (product_id) {
            if (mongoose.Types.ObjectId.isValid(product_id) == false) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid productId" });
            }
        }
        //fetch product using productId
        const product = await productModel.findOne({
            $and: [{ product_id }, { isDeleted: false }],
        });
        if (!product) {
            return res.status(404).send({ status: true, data: "product not found" });
        }

        //reading updates
        let updates = req.Body

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, productImage, style, availableSizes, installments } = updates

        if (title) {
            //check uniqueness of product title
            const uniqueTitle = await productModel.findOne(title);

            if (uniqueTitle) {
                return res.status(400).send({ status: false, message: `${title} already exist` });
            }
            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, msg: "title is required" })
            }
        }

        if (description) {
            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, msg: "description is required" })
            }
        }
        if (price) {
            if (!validator.isValid(price)) {
                return res.status(400).send({ status: false, msg: "price is required" })
            }
        }
        if (currencyId) {
            if (!validator.isValid(currencyId)) {
                return res.status(400).send({ status: false, msg: "currencyId is required" })
            }
        }
        if (currencyFormat) {
            if (!validator.isValid(currencyFormat)) {
                return res.status(400).send({ status: false, msg: "currencyFormat is required" })
            }
        }
        if (isFreeShipping) {
            if (!validator.isValid(isFreeShipping)) {
                return res.status(400).send({ status: false, msg: "isFreeShipping is required" })
            }
        }
        if (productImage) {
            if (!validator.isValid(productImage)) {
                return res.status(400).send({ status: false, msg: "productImage is required" })
            }
        }
        if (style) {
            if (!validator.isValid(style)) {
                return res.status(400).send({ status: false, msg: "style is required" })
            }
        }
        if (availableSizes) {
            if (!validator.isValid(availableSizes)) {
                return res.status(400).send({ status: false, msg: "availableSizes is required" })
            }
        }
        if (installments) {
            if (!validator.isValid(installments)) {
                return res.status(400).send({ status: false, msg: "installments is required" })
            }
        }


        let files = req.files
        if (files && files.length > 0) {
            var profilePicUrl = await uploadFile(files[0])
        } else {
            return res.status(400).send({ msg: "No files found" })
        }
        let productExist = await productModel.findOne({ _id: product_id })
        if (!productExist) {
            return res.status(404).send({ status: false, msg: "Product not found" })
        }
        updates.productImage = profilePicUrl

        let productUpdated = await userModel.findOneAndUpdate({ _id: product_id }, { $set: updates }, { new: true })
        res.status(200).send({ status: true, message: "Product updated", date: productUpdated })



    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports= {updateProduct, getProduct, productByQuery }
