const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const AppError = require("./../Exceptions/AppError")
const prisma = require('./../Config/Prisma')
const UserDataAccess = require('./../DataAccess/UserDataAccess')
const AuthService = require('./Auth')
const fs = require('fs');
const base64 = require('base64-js');




class UserService {
    static async AddUserDatabase(Username, Email, userId, Bio){
        try{
            //DATAACCESS LAYER 
            await UserDataAccess.CreateUser(userId, Email, Username, Bio);
        }
        catch(e){
            await AuthService.DeleteUserAccount(userId);
            UserService.DeleteProfilePic(userId);
            throw new AppError(e.message, 500);
        }

    }

    static StoreProfilePic(UserId, EncodedImage){
        try{

            try{
                UserService.DeleteProfilePic(UserId)
            }
            catch(err){}

            // Decode the base64 string to binary data
            const BinaryImage = base64.toByteArray(EncodedImage);

            // Specify the file path where you want to save the image
            const filePath = `./ProfilePics/${UserId}.png`;

            // Write the binary data to a file
            fs.writeFileSync(filePath, BinaryImage);

        }
        catch(e){
            throw new AppError(e.message, 500);
        }

    }


    static DeleteProfilePic(UserId){
        try{

            const filePath = `./ProfilePics/${UserId}.png`;

            fs.rmSync(filePath, {
                force: true,
            });

        }
        catch(e){
            throw new AppError(e.message, 500);
        }

    }

    static GetProfilePic(UserId){
        try{

            const filePath = `./ProfilePics/${UserId}.png`;

            const imageData = fs.readFileSync(filePath);

            // Encode the image data as Base64
            const base64String = imageData.toString('base64');
        
            return base64String;

        }
        catch(e){
            return "";
        }

    }





}


module.exports = UserService;