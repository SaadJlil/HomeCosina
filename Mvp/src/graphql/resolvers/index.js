const AuthMiddleware = require('./../../Middleware/AuthMiddleware')
const prisma = require('./../../Config/Prisma')
const RecipeController = require('./../../Controllers/recipe')



module.exports = {
    GetRecipeById: AuthMiddleware.Authorize(RecipeController.getRecipeById),
    CreateRecipe: AuthMiddleware.Authorize(RecipeController.createRecipe),
    DeleteRecipe: AuthMiddleware.Authorize(RecipeController.deleteRecipe),
    EditRecipe: AuthMiddleware.Authorize(RecipeController.editRecipe),

    createArticle: async args => {
        try {
            console.log("thing")
        } catch (error) {
            throw error
        }
    },
}