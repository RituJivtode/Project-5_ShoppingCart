//====================================================================================
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const mongoose = require("mongoose")

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const authentication = function ( req, res, next) {
    try{
        let token = (req.Authorization);

        if(!token){
            return res.status(400).send({status:false, message: "Token must be present...!"});
        }

        let decodedToken = jwt.verify(token, "functionup-uranium");

        if (!decodedToken){
            return res.status(400).send({ status: false, message: "Token is invalid"});
        }
          
        let userLoggedIn = decodedToken.userId;
        req["userId"] = userLoggedIn;
        next();
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const authorization1 = async function(req,res,next){
    try{
        let userId = req.params.userId;
        let id = req.userId;
        if(!isValidObjectId(bookId)){
            return res.status(400).send({ status: false, message: "Please enter valid userId" })
         }
         let user = await userModel.findOne({_id:userId});
        if(!user){
            return res.status(404).send({ status: false, message: "No such user" }) 
        }
        if(id != user._id){
            return res.status(403).send({status: false , message : "Not authorized..!" });
        }
        next();
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}



module.exports = {authentication,authorization1}