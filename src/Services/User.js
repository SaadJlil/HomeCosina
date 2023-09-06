const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const AppError = require("./../Exceptions/AppError")
const prisma = require('./../Config/Prisma')
const UserDataAccess = require('./../DataAccess/UserDataAccess')
const AuthService = require('./Auth')


class UserService {
    static async AddUserDatabase(Username, Email, uuid){
        try{
            //DATAACCESS LAYER 
            await UserDataAccess.CreateUser(Email, Username);
        }
        catch(e){
            await AuthService.DeleteUserAccount(uuid);
            throw new AppError(e.message, 500);
        }

    }
}


module.exports = UserService;