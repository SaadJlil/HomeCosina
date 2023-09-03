const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const AppError = require("./../Exceptions/AppError")
const prisma = require('./../Config/Prisma')


class UserService {
    @TryCatchErrorsDecorator
    static async AddUserDatabase(Username, Email, next){
        try{
            //DATAACCESS LAYER 
            await prisma.user.create({
                data: {
                    email: Email,
                    username: Username 
                },
            });
        }
        catch(e){
            throw new AppError(e.message, 500)
        }

    }
}


module.exports = UserService;