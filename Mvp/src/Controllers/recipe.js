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

        return await RecipeDataAccess.getRecipeById(args.recipe_id);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async getUserRecipes(args) {
        ValidationMiddleware.GetUserRecipesValidationMiddleware(args.user_id, args.page_nb, args.row_nb);

        return await RecipeDataAccess.getUserRecipes(args.user_id, args.page_nb, args.row_nb);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async createRecipe(args) {
        ValidationMiddleware.CreateRecipeValidationMiddleware(args.createRecipeArgs);

        return await RecipeDataAccess.createRecipe(args.createRecipeArgs, args.userId);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async deleteRecipe(args) {
        ValidationMiddleware.DeleteRecipeValidationMiddleware(args.recipe_id);

        await RecipeDataAccess.deleteRecipeById(args.recipe_id, args.userId, true);

        return args.recipe_id;
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async editRecipe(args) {
        ValidationMiddleware.EditRecipeValidationMiddleware(args.editRecipeArgs);

        await RecipeDataAccess.editRecipeById(args.editRecipeArgs, args.userId);

        return args.editRecipeArgs.recipe_id;
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async searchRecipesByQuery(args) {

        const Query = args.Query.toLowerCase();

        ValidationMiddleware.SearchRecipesByQueryValidationMiddleware(Query, args.page_nb, args.row_nb);

        return await RecipeDataAccess.SearchRecipesByQuery(Query, args.page_nb, args.row_nb);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async searchSuggestionsRecipe(args) {

        const Query = args.Query.toLowerCase();

        ValidationMiddleware.SearchSuggestionsRecipeValidationMiddleware(Query, args.page_nb, args.row_nb);

        return await RecipeDataAccess.SearchSuggestionsRecipe(Query, args.page_nb, args.row_nb);
    }


    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async searchRecipesByIng(args) {
        ValidationMiddleware.SearchRecipesByIngValidationMiddleware(args.Ingredients, args.page_nb, args.row_nb);

        return await RecipeDataAccess.SearchRecipesByIng(args.Ingredients, args.page_nb, args.row_nb);
    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async searchRecipesByQueryIng(args) {

        const Query = args.Query.toLowerCase();

        ValidationMiddleware.SearchRecipesByQueryIngValidationMiddleware(Query, args.Ingredients, args.page_nb, args.row_nb);

        return await RecipeDataAccess.SearchRecipesByQueryIng(Query, args.Ingredients, args.page_nb, args.row_nb);

    }

    @ErrorCatcher.TryCatchErrorsDecoratorAsync
    static async VoteRecipe(args) {
        ValidationMiddleware.VoteRecipeValidationMiddleware(args.recipe_id);

        await RecipeDataAccess.voteRecipe(args.userId, args.recipe_id, args.vote_value ? 1 : -1);

        return args.recipe_id;
    }

} 

module.exports = RecipeController;