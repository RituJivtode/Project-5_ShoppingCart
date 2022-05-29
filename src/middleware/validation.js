const isValid = function(value) {
    if (typeof(value) === 'undefined' || typeof(value) === null) {
        return false
    }
    // if (typeof (value).trim().length === 0) {
    //     return false
    // }
    if (typeof(value) === "string" && (value).trim().length > 0) {
        return true
    }

}
const isValidTotal = function (value) {
    if (typeof (value) === 'undefined' || typeof (value) === null) {
        return false
    }
    if (typeof (value).trim().length === 0) {
        return false
    }
    if (typeof (value) === "number" && (value).trim().length > 0) {
        return true
    }
    
}
const validInstallment = function isInteger(value) {
    if (value < 0) return false
    if (value % 1 == 0) return true
}
<<<<<<< HEAD


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

// const isValidQuantity = function(value){
   
// }

module.exports.isValidTotal = isValidTotal;
module.exports.isValid = isValid;

module.exports.validInstallment = validInstallment;
module.exports.isValidRequestBody= isValidRequestBody
=======
module.exports.isValid = isValid;
module.exports.validInstallment = validInstallment;
>>>>>>> dd9ce2e9c5656a92d3c8cda8132f6ea93d49546c
