const TryCatchErrorsDecorator = require('../Decorators/TryCatchErrorsDecorator');
const ClientError = require('../Exceptions/ClientError');
const usernameValidator = require('../Services/ValidateUsername');
const picValidator = require('../Services/ValidatePic');
const emailValidator = require('./../Services/ValidateEmail');



class UserValidationMiddleware{

    @TryCatchErrorsDecorator
    static async getUserInfo(req, res, next){

        if (!req.body.userId || req.body.userId.length > 36) {
            throw new ClientError("A valid user Id is required", 400);
        }

        return next();
    }

    @TryCatchErrorsDecorator
    static async editUserInfo(req, res, next){

        if (!!req.body.email) {
            await emailValidator.signUp(req.body.email);
        }
       
        if (!!req.body.username) {
            await usernameValidator(req.body.username)
        }  

        if (!!req.body.bio && req.body.bio.length > 500) {
            throw new ClientError("Bio must be less than 500 characters long", 400);
        }

        if(!!req.body.profilepic){
            picValidator(req.body.profilepic);
        }

        return next();

    }


}


module.exports = UserValidationMiddleware;