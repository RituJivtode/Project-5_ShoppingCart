const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const aws = require("aws-sdk")
const { AppConfig } = require('aws-sdk');
const validator = require("../middleware/validation")
const mongoose = require("mongoose")

const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async(file) => {
    return new Promise(function(resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket", //HERE
            Key: "abc/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function(err, body) {
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


const createUser = async function(req, res) {
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

        // //password Number is Mandatory...
        // if (!validator.isValid(password)) {
        //     return res.status(400).send({ Status: false, message: " password is required" })
        // }
        // password Number is Valid...
        let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
        if (!Passwordregex.test(password)) {
            return res.status(401).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
        }

        //generate salt to hash password
        const salt = await bcrypt.genSalt(10);
        // now we set user password to hashed password
        passwordValue = await bcrypt.hash(password, salt);


        //----------------------------------------------address--------------------------------

        let address = req.body.address


        if (address.shipping) {
            if (address.shipping.street) {
                if (validator.isValidRequestBody(address.shipping.street)) {
                    return res.status(400).send({ status: false, msg: "shipping address is required" })
                }
            }
            return res.status(400).send({ status: false, msg: "shipping street is required" })
        } else {
            return res.status(400).send({ status: false, msg: "shipping address is required" })
        }



        //----------------------------------------------address--------------------------------



        // let filterBody = { fname: fname, lname: lname, email: email, phone: phone, password: passwordValue, address: address }
        // filterBody.profileImage = profilePicUrl
        // let userCreated = await userModel.create(filterBody)
        // res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

//     //----------------------------------------------address--------------------------------

//     let StreetRegex = /^[A-Za-z1-9]{1}[A-Za-z0-9/ ,]{5,}$/
//     let PinCodeRegex = /^[1-9]{1}[0-9]{5}$/

//     let addressData = req.body.address
//     console.log(req.body.address)

//     let address = JSON.parse(addressData)

//     if (Object.keys(address).length != 0) {
//         if (!StreetRegex.test(address.shipping.street)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid street address" })
//         }
//         if (!validator.isValid(address.shipping.city)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid city name" })
//         }
//         if (!PinCodeRegex.test(address.shipping.pincode)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid pincode of 6 digit" })
//         }
//         if (!StreetRegex.test(address.billing.street)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid street address" })
//         }
//         if (!validator.isValid(address.billing.city)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid city name" })
//         }
//         if (!PinCodeRegex.test(address.billing.pincode)) {
//             return res.status(400).send({ Status: false, message: " Please enter a valid pincode of 6 digit" })
//         }
//     } else {
//         return res.status(400).send({ status: false, message: "Address is required" })
//     }

//     let filterBody = { fname: fname, lname: lname, email: email, phone: phone, password: passwordValue, address: address }
//     filterBody.profileImage = profilePicUrl
//     let userCreated = await userModel.create(filterBody)
//     res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

// } catch (error) {
//     res.status(500).send({ status: false, msg: error.message })
// }

// }
//---------------------------------------------------------------------------

const login = async function(req, res) {
    try {

        let body = req.body

        if (Object.keys(body).length === 0) {
            return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
        }

        //****------------------- Email validation -------------------****** //

        if (!validator.isValid(body.email)) {
            return res.status(400).send({ status: false, msg: "Email is required" })
        };

        // For a Valid Email...
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(body.email))) {
            return res.status(400).send({ status: false, message: ' Email should be a valid' })
        };


        //******------------------- password validation -------------------****** //

        if (!validator.isValid(body.password)) {
            return res.status(400).send({ Status: false, message: " password is required" })
        }

        //******------------------- checking User Detail -------------------****** //


        let CheckUser = await userModel.findOne({ email: body.email });

        if (!CheckUser) {
            return res.status(400).send({ Status: false, message: "email is not correct" });
        }

        let passwordMatch = await bcrypt.compare(body.password, CheckUser.password)
        if (!passwordMatch) {
            return res.status(400).send({ status: false, msg: "incorect password" })
        }
        //******------------------- generating token for user -------------------****** //
        let userToken = jwt.sign({

            UserId: CheckUser._id,
            batch: "Uranium"

        }, 'FunctionUp Group21', { expiresIn: '86400s' }); // token expiry for 24hrs

        return res.status(200).send({ status: true, message: "User login successfull", data: { UserId: CheckUser._id, token: userToken } });
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

//====================================== Get User =============================================

const getUser = async function(req, res) {
    try {
        //reading userid from path
        const _id = req.params.userId;

        //id format validation
        if (_id) {
            if (!isValidObjectId(_id)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Invalid userId" });
            }
        }

        const user = await userModel.findOne($and({ _id: _id }, { isDeleted: false }))
            //no users found
        if (!user) {
            return res.status(404).send({ status: false, message: "user not found" });
        }
        //return user in response
        return res.status(200).send({ status: true, data: user });


    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}



//--------------------------------------------------------------------

const updateUser = async function(req, res) {
    try {
        let requestBody = req.body

        let user_id = req.params.userId
        let files = req.files
        let Passwordregex = /^[A-Z0-9a-z]{1}[A-Za-z0-9.@#$&]{7,14}$/
        let Phoneregex = /^[6-9]{1}[0-9]{9}$/
        let StreetRegex = /^[A-Za-z1-9]{1}[A-Za-z0-9/ ,]{5,}$/
        let PinCodeRegex = /^[1-9]{1}[0-9]{5}$/

        let { fname, lname, email, phone, password, address } = requestBody

        let filterBody = {};
        let value = await userModel.findOne({ _id: user_id })

        //========================================================================
        if (req.files == undefined) {
            if (Object.keys(requestBody).length === 0) {
                return res.status(400).send({ Status: false, message: " Sorry Body can't be empty" })
            }
        }

        //=========================================================================
        // if(req.body.length)
        if (Object.keys(req.body).length === 0) {
            if (req.files.length === 0) {
                return res.status(400).send({ Status: false, message: "please select file" })
            }
        }
        if (files && files.length > 0) {

            let profilePhotoUrl = await uploadFile(files[0]);
            filterBody.profileImage = profilePhotoUrl

        }

        if ("fname" in requestBody) {

            if (!validator.isValid(fname)) {
                return res.status(400).send({ status: false, message: "give fname in the request body " })
            }

            filterBody["fname"] = fname

        }
        if ("lname" in requestBody) {

            if (!validator.isValid(lname)) {
                return res.status(400).send({ status: false, message: "give lname in the request body " })
            }

            filterBody["lname"] = lname

        }
        if ("email" in requestBody) {
            if (!validator.isValid(email)) {
                return res.status(400).send({ status: false, message: "give email in request body" })
            }
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email))) {
                return res.status(400).send({ status: false, message: ' Email should be a valid' })
            };
            //unique email============
            let uniqueEmail = await userModel.findOne({ email: email })
            if (uniqueEmail) {
                return res.status(400).send({ status: false, message: ' This email is already present' })
            }

            filterBody["email"] = email

        }
        if ("phone" in requestBody) {
            if (!validator.isValid(phone)) {
                return res.status(400).send({ status: false, message: "give phone no. in request body" })
            }
            if (!Phoneregex.test(phone)) {
                return res.status(400).send({ status: false, message: ' phone no. should be a valid' })
            };
            //unique phone no.===============
            let uniqueNumber = await userModel.findOne({ phone: phone })
            if (uniqueNumber) {
                return res.status(400).send({ status: false, message: ' This Phone no. is already present' })
            }

            filterBody["phone"] = phone

        }

        if ("password" in requestBody) {
            if (!validator.isValid(password)) {
                return res.status(400).send({ Status: false, message: " password is required" })
            }
            // password Number is Valid...
            if (!Passwordregex.test(password)) {
                return res.status(401).send({ Status: false, message: " Please enter a valid password, minlength 8, maxxlength 15" })
            }

            //generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
            password = await bcrypt.hash(password, salt);

            filterBody["password"] = password

        }

        if ("address" in requestBody) {
            address = JSON.stringify(address)
            address = JSON.parse(address)

            if (!address || Object.keys(address).length == 0) return res.status(400).send({ status: false, message: "Please enter address and it should be in object!!" })
                //  address = JSON.stringify(address)
                //  address= JSON.parse(address)
            const { shipping, billing } = address
            if ("shipping" in address) {
                const { street, city, pincode } = shipping
                if ("street" in shipping) {
                    if (!validator.isValid(street)) {
                        return res.status(400).send({ status: false, message: "street is not valid" })
                    }
                    filterBody["address.shipping.street"] = street
                }
                if ("city" in shipping) {
                    if (!validator.isValid(city)) {
                        return res.status(400).send({ status: false, message: "city is not valid" })
                    }
                    filterBody["address.shipping.city"] = city
                }
                if ("pincode" in shipping) {
                    if (!PinCodeRegex(pincode)) {
                        return res.status(400).send({ status: false, message: "pincode is not valid" })
                    }
                    filterBody["address.shipping.pincode"] = pincode
                }
            }

            if ("billing" in address) {
                const { street, city, pincode } = billing
                if ("street" in billing) {
                    if (!validator.isValid(street)) {
                        return res.status(400).send({ status: false, message: "street is not valid" })
                    }
                    filterBody["address.billing.street"] = street
                }

                if ("city" in billing) {
                    if (!validator.isValid(city)) {
                        return res.status(400).send({ status: false, message: "city is not valid" })
                    }
                    filterBody["address.billing.city"] = city
                }
                if ("pincode" in billing) {
                    if (!PinCodeRegex(pincode)) {
                        return res.status(400).send({ status: false, message: "pincode is not valid" })
                    }
                    filterBody["address.billing.pincode"] = pincode
                }
            }
        }
        // filterBody["address"] = address





        let updates = await userModel.findOneAndUpdate({ _id: user_id }, { $set: filterBody }, { new: true })
<<<<<<< HEAD
        // let info = await userModel.findOne({_id:user_id})
        // update= address.billing
        res.status(200).send({ status: true, message: "User profile updated", data: updates })
    }

    catch (error) {
=======
            // let info = await userModel.findOne({_id:user_id})
            // update= address.billing
        res.status(200).send({ status: true, message: "User profile updated", data: updates })
    } catch (error) {
>>>>>>> c06fe13a89648b2caedae2680833048098182f03
        res.status(500).send({ status: false, msg: error.message })
    }

}



module.exports = { createUser, login, updateUser, getUser }