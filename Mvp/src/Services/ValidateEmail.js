const emailValid = require('email-validator');
const ClientError = require('../Exceptions/ClientError');
const UserDataAccess = require('../DataAccess/UserDataAccess');

class emailValidator{
    static async signUp(email){
        const EmailValid = await emailValid.validate(email);
        if(!EmailValid){
            throw new ClientError("The email used is not valid", 400);
        }
    
        const EmailExists = await UserDataAccess.UserEmailExists(email);
        if(EmailExists){
            throw new ClientError("The email used is already taken", 409);
        }
    }

    static async signIn(email){
        const EmailExists = await UserDataAccess.UserEmailExists(email);
        if(!EmailExists){
            throw new ClientError("No account is under the input email", 409);
        }
    }
}


module.exports = emailValidator;