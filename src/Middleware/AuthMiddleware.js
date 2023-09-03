const emailValidator = require('./../Services/ValidateEmail');
const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const passwordValid = require('../Services/ValidatePassword');

const ClientError = require('../Exceptions/ClientError');
const UserDataAccess = require('./../DataAccess/UserDataAccess');




class AuthMiddleware{
    @TryCatchErrorsDecorator
    static async VerifyEmailPassw(req, res, next){

        if (!req.body.email ) {
            throw new ClientError("Email is required", 400);
        }

        if (!req.body.password ) {
            throw new ClientError("Password is required", 400);
        }  

        const EmailValid = emailValidator(req.body.email);
        if(!EmailValid){
            throw new ClientError("The email used is not valid", 400);
        }


        const PasswordValid = passwordValid(req.body.password);
        if(PasswordValid.isError){
            throw PasswordValid.Error;
        }
        
        const EmailExists = await UserDataAccess.UserEmailExists(req.body.email);
        console.log(EmailExists);
        if(EmailExists){
            throw new ClientError("The email used is already taken", 409);
        }

        return next();

    }
}

module.exports = AuthMiddleware;