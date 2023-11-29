const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const AppError = require("./../Exceptions/AppError")
const prisma = require('./../Config/Prisma')
const UserDataAccess = require('./../DataAccess/UserDataAccess')
const AuthService = require('./Auth')
const fs = require('fs');
const base64 = require('base64-js');
const ImageDataAccess = require('./../DataAccess/ImageDataAccess');




class UserService {

    static async AddUserDatabase(Username, Email, userId, Bio, mainImageUrl, thumbnailImageUrl){
        try{
            //DATAACCESS LAYER 
            await UserDataAccess.CreateUser(userId, Email, Username, Bio, mainImageUrl, thumbnailImageUrl);
        }
        catch(e){
            await AuthService.DeleteUserAccount(userId);
            ImageDataAccess.DeleteImage(userId);
            throw new AppError(e.message, 500);
        }

    }

}


module.exports = UserService;