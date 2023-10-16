const TryCatchErrorsDecorator = require('../Decorators/TryCatchErrorsDecorator');
const ClientError = require('../Exceptions/ClientError');




class UserValidationMiddleware{

    @TryCatchErrorsDecorator
    static async getUserInfo(req, res, next){

        if (!req.body.userId || req.body.userId.length > 36) {
            throw new ClientError("A valid user Id is required", 400);
        }

        return next();

    }

}


module.exports = UserValidationMiddleware;