const userModel = require("../models/userModel")
const jwt = require("jsonwebtoken")
const validation = require("../middleware/validation")
const bcrypt = require("bcrypt")


let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     // this function will upload file to aws and return the link
     let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  //HERE
         Key: "nrjp/" + file.originalname, //HERE 
         Body: file.buffer
     }
 
 
     s3.upload( uploadParams, function (err, data ){
         if(err) {
             console.log(err)
             return reject({"error": err})
         }
         console.log(data)
         console.log("file uploaded succesfully")
         return resolve(data.Location)
     })
 
    })
 }


const createUser = async function(req, res) {
    try {

        let body = req.body
        let files = req.files

        
            // generate salt to hash password
           const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
          req.body.password = await bcrypt.hash(eq.body.password, salt);

        if (files && files.length > 0) {
           
            var profilePicUrl = await uploadFile(files[0]);
        
        } else {
            res.status(400).send({ msg: "No file found" })
        }
        const { fname, lname, email, phone, password, address } = body
        body.profileImage = profilePicUrl


        let userCreated = await userModel.create(body)
        res.status(201).send({ status: true, msg: "user created successfully", data: userCreated })

    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }

}

module.exports = { createUser }