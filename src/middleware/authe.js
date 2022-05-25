const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const validateToken = async function(req, res, next){
let token = req.headers["x-Auth-token"];
if (!token) token = req.headers["x-auth-token"]; //heder is caseinsenstive

//If no token is present in the request header return error
if (!token) {
    return res.send({ status: false, msg: "token must be present" });
}
/////

let decodedToken =jwt.verify(token, "functionup-uranium")
console.log(decodedToken.userId)
 if (!decodedToken){
  return res.send({ status: false, msg: "token is invalid" });
 }


next()
}