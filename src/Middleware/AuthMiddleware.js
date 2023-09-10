const emailValidator = require('./../Services/ValidateEmail');
const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const passwordValid = require('../Services/ValidatePassword');
const usernameValidator = require('../Services/ValidateUsername');
const firebase = require("../Config/firebaseClient");
const AuthService = require("../Services/Auth");
const TokenService = require("../Services/TokenService");

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

        await emailValidator.signUp(req.body.email);

        await passwordValid(req.body.password);

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
    static async Authorize(req, res, next){
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
      
            if (!token) {
              throw new ClientError("Access token not found in request", 400);
            }
      
            //const verifyData = await AuthService.verifyAccessToken(token);
            const verifyData = await TokenService.verifyAccessToken(token);
      
            req.userId = verifyData.id;
            req.refreshTokenId = verifyData.refreshId;

            return next();
          }
      
          throw new ClientError("Unauthorized", 401);

   }

}


module.exports = AuthMiddleware;