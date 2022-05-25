const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const aws = require("aws-sdk")
const { AppConfig } = require('aws-sdk');
const validator = require("../middleware/validation")

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, body) {
            if (err) {
                console.log(err)
                return reject({ "error": err })
            }
            console.log(body)
            console.log("file uploaded succesfully")
            return resolve(body.Location)
        })

    })
}


const createUser = async function (req, res) {
    try {

        let body = req.body
        let files = req.files

        if (files && files.length > 0) {

            var profilePicUrl = await uploadFile(files[0]);

        } else {
            return res.status(400).send({ msg: "No file found" })
        }
        const { fname, lname, email, phone, password } = body
        // body.profileImage= profilePicUrl


        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, msg: "fullname is required" })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, msg: " Lastname is required" })
        }
        // Email is Mandatory...
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };
        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(body.email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };

        // Email is Unique...
        let duplicateEmail = await userModel.findOne({ email: body.email })
        if (duplicateEmail) {
            return res.status(400).send({ status: false, msg: 'Email already exist' })
        };

        // phone Number is Mandatory...
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: 'phone number is required' })
        };
          // phone Number is Valid...
          let Phoneregex = /^[6-9]{1}[0-9]{9}$/

          if (!Phoneregex.test(phone)) {
              return res.status(400).send({ Status: false, message: " Please enter a valid phone number" })
          }
  

        // phone Number is Unique...
        let duplicateMobile = await userModel.findOne({ phone: body.phone })
        if (duplicateMobile) {
            return res.status(400).send({ status: false, msg: 'phone number already exist' })
        };

        //password Number is Mandatory...
        if (!validator.isValid(password)) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }
        // password Number is Valid...
        let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
        if (!Passwordregex.test(password)) {
            return res.status(401).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        }



        //----------------------------------------------address--------------------------------

        let StreetRegex = /^[A-Za-z1-9]{1}[A-Za-z0-9/ ,]{5,}$/
        let PinCodeRegex = /^[1-9]{1}[0-9]{5}$/

        let addressData = req.body.address
        
        let address = JSON.parse(addressData)

        if (address) {
            if (!StreetRegex.test(address.shipping.street)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid street address" })
            }
            if (!validator.isValid(address.shipping.city)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid city name" })
            }
            if (!PinCodeRegex.test(address.shipping.pincode)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid pincode of 6 digit" })
            }

            if (!StreetRegex.test(address.billing.street)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid street address" })
            }
            if (!validator.isValid(address.billing.city)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid city name" })
            }
            if (!PinCodeRegex.test(address.billing.pincode)) {
                return res.status(400).send({ Status: false, message: " Please enter a valid pincode of 6 digit" })
            }
        }
        else {
            return res.status(400).send({ status: false, message: "Address is required" })
        }

           //generate salt to hash password
           const salt = await bcrypt.genSalt(10);
           // now we set user password to hashed password
           passwordValue = await bcrypt.hash(password, salt);

        let filterBody = { fname: fname, lname: lname, email: email, phone: phone, password: passwordValue, address: address }
        filterBody.profileImage = profilePicUrl
        let userCreated = await userModel.create(filterBody)
        res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}


const login = async function (req, res) {
    try {

        let body = req.body

        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        //******------------------- Email validation -------------------****** //

        if (!validator.isValid(body.email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(body.email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };

        let FinalEmail = body.email
        // let changeEmail= FinalEmail.toLowerCase()  // changing capital word into lowercase

        //******------------------- password validation -------------------****** //

        if (!validator.isValid(body.password)) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }

        // let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
        // if (!Passwordregex.test(body.password)) {
        //     return res.status(400).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        // }

        //******------------------- checking User Detail -------------------****** //


        let CheckUser = await userModel.findOne({ email: FinalEmail, password: body.password });

        if (!CheckUser) {
            return res.status(400).send({ Status: false, message: "username or the password is not correct" });
        }
        //******------------------- generating token for user -------------------****** //
        let user_token = jwt.sign({

            UserId: CheckUser._id,
            batch: "Uranium"

        }, 'FunctionUp Group21', { expiresIn: '86400s' });    // token expiry for 24hrs

        res.setHeader("x-api-key", user_token);
        return res.status(200).send({ status: true, data: { userId:CheckUser._id, token: user_token,}});


    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updateUser = async function (req, res) {
    try {
        let requestBody = req.body
        let user_id = req.params.userId
        let files = req.files
        const { fname, lname, email, phone, password, address } = requestBody

        if (files && files.length > 0) {

            var profilePhotoUrl = await uploadFile(files[0]);

        } else {
            return res.status(400).send({ msg: "No file found" })
        }
        let userExist = await userModel.findOne({ _id: user_id })
        if (!userExist) {
            return res.status(404).send({ status: false, message: "User not found" })
        }
        requestBody.profileImage = profilePhotoUrl
        let update = await userModel.findOneAndUpdate({ _id: user_id }, { $set: requestBody }, { new: true })
        res.status(200).send({ status: true, message: "User profile updated", date: update })


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

module.exports = { createUser, login, updateUser }

