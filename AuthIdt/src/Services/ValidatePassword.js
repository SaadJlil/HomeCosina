const ClientError = require('./../Exceptions/ClientError');
const passwordValidator = require('check-password-strength')




function passwordValid(password){
    const passwordAnalysis = passwordValidator.passwordStrength(password)

    if(passwordAnalysis.length > 128){
        throw new ClientError("Password should be less than 128 characters", 400);
    }


    if(passwordAnalysis.length < 8){
        throw new ClientError("Password should be over 8 characters", 400);
    }


    if(passwordAnalysis.id < 2){
        throw new ClientError("Weak Password: Should contain at least: 1 lowercase alphabetical character, 1 uppercase alphabetical character, 1 numeric character and a special character", 400);
    }

}



module.exports = passwordValid;