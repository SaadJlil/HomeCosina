const prisma = require('./../Config/Prisma')
const ErrorCatcher = require('./../Decorators/TryCatchErrorsDecorator');
const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const RecipeDataAccess = require('./../DataAccess/RecipeDataAccess')
const ValidationMiddleware = require('./../Middleware/ValidationMiddleware')


//const Error = require('Error');
    
    
    
    
class RecipeController{
    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async getRecipeById(args) {
        ValidationMiddleware.GetRecipeByIdValidationMiddleware(args.recipe_id);

        return RecipeDataAccess.getRecipeById(args.recipe_id);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async createRecipe(args) {
        ValidationMiddleware.CreateRecipeValidationMiddleware(args.createRecipeArgs);

        return await RecipeDataAccess.createRecipe(args.createRecipeArgs, args.userId);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async deleteRecipe(args) {
        ValidationMiddleware.DeleteRecipeValidationMiddleware(args.recipe_id);

        await RecipeDataAccess.deleteRecipeById(args.recipe_id, args.userId);

        return args.recipe_id;
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async editRecipe(args) {
        ValidationMiddleware.EditRecipeValidationMiddleware(args.editRecipeArgs);

        await RecipeDataAccess.editRecipeById(args.editRecipeArgs, args.userId);

        return args.editRecipeArgs.recipe_id;
    }

} 

module.exports = RecipeController;