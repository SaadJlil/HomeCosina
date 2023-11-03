const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const passwordValid = require('../Services/ValidatePassword');
const usernameValidator = require('../Services/ValidateUsername');
const picValidator = require('../Services/ValidatePic');
const firebase = require("../Config/firebaseClient");
const AuthService = require("../Services/Auth");
const TokenService = require("../Services/TokenService");
const emailValidator = require('./../Services/ValidateEmail');

const ClientError = require('../Exceptions/ClientError');
const UserDataAccess = require('./../DataAccess/UserDataAccess');




class AuthMiddleware{
    @TryCatchErrorsDecorator
    static async ValidateSignUp(req, res, next){

        if (!req.body.email) {
            throw new ClientError("Email is required", 400);
        }

        if (!req.body.password) {
            throw new ClientError("Password is required", 400);
        }  
        
        if (!req.body.username) {
            throw new ClientError("Username is required", 400);
        }  

        if (!!req.body.bio && req.body.bio.length > 500) {
            throw new ClientError("Bio must be less than 500 characters long", 400);
        }

        if(!!req.body.profilepic){
            picValidator(req.body.profilepic);
        }

        await emailValidator.signUp(req.body.email);

        passwordValid(req.body.password);

        await usernameValidator(req.body.username)

        return next();

    }

    @TryCatchErrorsDecorator
    static async VerifyEmailPasswSignIn(req, res, next){
        const errorC = new ClientError("Problem with Email or Password", 400);

        if (!req.body.email ) {
            throw errorC;
        }


        if (!req.body.password ) {
            throw errorC;
        }  

        try{
            await emailValidator.signIn(req.body.email);
            await passwordValid(req.body.password);
        }
        catch(error){
            throw errorC;
        }

        return next();

    }

    @TryCatchErrorsDecorator
    static async AuthorizeAccess(req, res, next){
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
        
            if (!token) {
                throw new ClientError("Access token not found in request", 400);
            }
        
            const verifyData = await TokenService.verifyAccessToken(token);
        
            req.userId = verifyData.id;
            req.refreshTokenId = verifyData.refreshId;

            if(req.emailConfirmation){
                const emailConfirmed = await UserDataAccess.userEmailConfirmed(verifyData.id);
                if(!emailConfirmed){
                    throw new ClientError("Unauthorized: Email is not confirmed", 409);
                }
            }

            return next();
        }
        
        throw new ClientError("Unauthorized", 401);

    }
 
    static Authorize(emailConfirmation = true){
        return async (req, res, next) => {
            req.emailConfirmation = emailConfirmation;
            await this.AuthorizeAccess(req, res, next);
        }
    }

}


module.exports = AuthMiddleware;