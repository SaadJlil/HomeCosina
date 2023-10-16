const prisma = require('../Config/Prisma')
const ErrorCatcher = require('../Decorators/TryCatchErrorsDecorator');
const TryCatchErrorsDecorator = require('../Decorators/TryCatchErrorsDecorator');
const IngredientDataAccess = require('../DataAccess/IngredientDataAccess')
const ValidationMiddleware = require('../Middleware/ValidationMiddleware')


//const Error = require('Error');
    
    
    
    
class IngredientController{

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async getIngredientById(args) {
        ValidationMiddleware.GetIngredientByIdValidationMiddleware(args.ingredient_name);

        return await IngredientDataAccess.getIngredientById(args.ingredient_name);
    }

} 

module.exports = IngredientController;