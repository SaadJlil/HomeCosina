const emailValidator = require('./../Services/ValidateEmail');
const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const passwordValid = require('../Services/ValidatePassword');
const firebase = require("../Config/firebaseClient");
const AuthService = require("../Services/Auth");

const ClientError = require('../Exceptions/ClientError');
const UserDataAccess = require('./../DataAccess/UserDataAccess');




class AuthMiddleware{
    @TryCatchErrorsDecorator
    static async VerifyEmailPasswSignUp(req, res, next){

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

        if(EmailExists){
            throw new ClientError("The email used is already taken", 409);
        }

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

        const EmailValid = emailValidator(req.body.email);
        if(!EmailValid){
            throw errorC;
        }


        const PasswordValid = passwordValid(req.body.password);
        if(PasswordValid.isError){
            throw errorC;
        }
        
        const EmailExists = await UserDataAccess.UserEmailExists(req.body.email);

        if(!EmailExists){
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
      
            const verifyData = await AuthService.verifyAccessToken(token);
      
            if (!verifyData) {
              throw new ClientError("Refresh token invalid or expired", 401);
            }
      
            req.userId = verifyData.id;

            //return next();
          }
      
          throw new ClientError("Unauthorized", 401);

   }

}


module.exports = AuthMiddleware;