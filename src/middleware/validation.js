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

const validInstallment = function isInteger(value) {
    if (value < 0) return false
    if (value % 1 == 0) return true
}
module.exports.isValid = isValid;
module.exports.validInstallment = validInstallment;