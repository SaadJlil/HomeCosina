const AuthMiddleware = require('./../../Middleware/AuthMiddleware')
const prisma = require('./../../Config/Prisma')
const RecipeController = require('./../../Controllers/recipe')
const IngredientController = require('./../../Controllers/ingredient')



module.exports = {
    SearchRecipesByQuery: RecipeController.searchRecipesByQuery,
    SearchRecipesByIng: RecipeController.searchRecipesByIng,
    SearchRecipesByQueryIng: RecipeController.searchRecipesByQueryIng,
    SearchSuggestionsRecipe: RecipeController.searchSuggestionsRecipe,
    GetUserRecipes: RecipeController.getUserRecipes,
    GetIngredientById: IngredientController.getIngredientById,
    GetRecipeById: RecipeController.getRecipeById,
    CreateRecipe: AuthMiddleware.Authorize(RecipeController.createRecipe),
    DeleteRecipe: AuthMiddleware.Authorize(RecipeController.deleteRecipe),
    EditRecipe: AuthMiddleware.Authorize(RecipeController.editRecipe),
    SearchIngredientsByQuery: IngredientController.searchIngredientsByQuery,
    VoteRecipe: AuthMiddleware.Authorize(RecipeController.VoteRecipe)
}