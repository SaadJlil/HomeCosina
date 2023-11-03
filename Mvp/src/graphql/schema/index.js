const { buildSchema } = require("graphql")
const User = require('../typeDefs/UserType') 
const RecipeTypes = require('../typeDefs/RecipeType') 
const Ingredient = require('../typeDefs/IngredientType') 





module.exports = buildSchema(`#graphql

    #User
    ${User}

    #Recipe Types
    ${RecipeTypes.Recipe}
    ${RecipeTypes.GetRecipeByIdType}
    ${RecipeTypes.GetUserRecipesType}
    ${RecipeTypes.CreateRecipeType}
    ${RecipeTypes.EditRecipeType}
    ${RecipeTypes.SearchRecipesType}

    #Ingredient
    ${Ingredient.Ingredient}
    ${Ingredient.GetIngredientByIdType}
    ${Ingredient.SearchIngredientType}

    type Query {
        SearchRecipesByIng(Ingredients: [String!]!, page_nb: Int!, row_nb: Int!): [Return_SearchRecipes!],
        SearchRecipesByQuery(Query: String!, page_nb: Int!, row_nb: Int!): [Return_SearchRecipes!],
        SearchRecipesByQueryIng(Query: String!, Ingredients: [String!]!, page_nb: Int!, row_nb: Int!): [Return_SearchRecipes!],
        SearchSuggestionsRecipe(Query: String!, page_nb: Int!, row_nb: Int!): [String!],
        GetUserRecipes(user_id: ID!, page_nb: Int!, row_nb: Int!): [Return_GetUserRecipes!],
        GetRecipeById(recipe_id: ID!): Return_GetRecipeById!,
        GetIngredientById(ingredient_name: ID!): Return_GetIngredientById!
        SearchIngredientsByQuery(Query: String!, page_nb: Int!, row_nb: Int!): [Return_SearchIngredients!],
    }

    type Mutation {
        CreateRecipe(createRecipeArgs: Args_CreateRecipe!): ID!
        EditRecipe(editRecipeArgs: Args_EditRecipe!): ID!
        DeleteRecipe(recipe_id: ID!): ID!
        VoteRecipe(recipe_id: ID!, vote_value: Boolean!): ID!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`)
