const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
// const validation = require("../middleware/validation")
const bcrypt = require("bcrypt")
const aws = require("aws-sdk")
// const {AppConfig} = require('aws-sdk'); 
const validator = require("../middleware/validation")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
  secretAccessKey: "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",
    region: "ap-south-1"
  }) 
  
let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     // this function will upload file to aws and return the link
     let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  //HERE
         Key: "profile/" + file.originalname, //HERE 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err,  body ){
         if(err) {
             console.log(err)
             return reject({"error": err})
         }
         console.log( body)
         console.log("file uploaded succesfully")
         return resolve( body.Location)
     })
 
    })
 }


const createUser = async function(req, res) {
    try {
         
        let body = req.body
        console.log(body)
        let files = req.files
        // let userAddress = req.body.address
        // let addressData= JSON.parse(userAddress)
        // body.address=addressData
            // generate salt to hash password
        //    const salt = await bcrypt.genSalt(10);
        //     // now we set user password to hashed password
        //   req.body.password = await bcrypt.hash(req.body.password, salt);

        if (files && files.length > 0) {
           
            var profilePicUrl = await uploadFile(files[0]);
        
        } else { 
            return res.status(400).send({ msg: "No file found" })
        }
        const { fname, lname, email, phone, password, address} = body
        body.profileImage = profilePicUrl


        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        if(!validator.isValid(fname)){
            return res.status(400).send({status:false,msg:"fullname is required"})
        }
        if(!validator.isValid(lname)){
            return res.status(400).send({status:false,msg:" Lastname is required"})
        }
          // Email is Mandatory...
          if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // Email is Unique...
        let duplicateEmail = await userModel.findOne({ email:  body.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'Email already exist' })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test( body.email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };

        // phone Number is Mandatory...
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: 'phone number is required' })
        };

        // phone Number is Unique...
        let duplicateMobile = await userModel.findOne({ phone:  body.phone })
        if (duplicateMobile) {
            return res.status(400).send({ status: false, msg: 'phone number already exist' })
        };

        // phone Number is Valid...
        let Phoneregex = /^[6-9]{1}[0-9]{9}$/

        if (!Phoneregex.test(phone)) {
            return res.status(400).send({ Status: false, message: " Please enter a valid phone number" })
        }

        //password Number is Mandatory...
        if (!validator.isValid(password)) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }
       //password Number is Valid...
        let Passwordregex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/ 
        if (!Passwordregex.test(password)) {
            return res.status(401).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        }


              // generate salt to hash password
              const salt = await bcrypt.genSalt(10);
              // now we set user password to hashed password
            req.body.password = await bcrypt.hash(req.body.password, salt);
        // //----------------------------------------------address--------------------------------
   
        let streetregex = /^[A-Za-z1-9]{1}[A-Za-z0-9/ ,]{5,}$/
        let PinCodeRegex = /^[1-9]{1}[0-9]{5}$/
        
        if (validator.isValid(address)) {

            if ( streetregex.test(address.shipping.street)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid street address" })
            }
            if (!validator.isValid(address.shipping.city)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid city name" })
            }
            if (!PinCodeRegex.test(address.shipping.pincode)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid pincode of 6 digit" })
            }
        }
        else{
            return res.status(400).send({status:false, message:"address is required"})
        }
        if (validator.isValid(address)) {
            if ( streetregex.test(address.billing.street)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid street address" })
            }
            if (!validator.isValid(address.billing.city)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid city name" })
            }
            if (!PinCodeRegex.test(address.billing.pincode)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid pincode of 6 digit" })
            }
        }
        else{
            return res.status(400).send({status:false, message:"address is required"})
        }
        
        

        let userCreated = await userModel.create(body)
        res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
   
}


//============================== Update user ========================================================

const updateUser = async function(req, res){
try{
    let requestBody = req.body
    let user_id= req.params.userId
    let doc = req.files
    const { fname, lname, email, phone, password, address } =requestBody

    if (files && files.length > 0) {
           
        var profilePhotoUrl = await uploadFile(files[0]);
    
    } else { 
        return res.status(400).send({ msg: "No file found" })
    }
    let userExist = await userModel.findOne({_id:user_id})
    if(!userExist){
        return res.status(404).send({status:false, message:"User not found"})
    }
    requestBody.profileImage=profilePhotoUrl
    let update = await userModel.findOneAndUpdate({_id:user_id},{$set:requestBody},{new:true})
    res.status(200).send({status:true, message: "User profile updated", date:update})
    

} catch (error) {
    res.status(500).send({ status: false, msg: error.message })
}

}

module.exports = { createUser, updateUser}