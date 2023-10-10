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
    ${RecipeTypes.CreateRecipeType}
    ${RecipeTypes.EditRecipeType}

    #Ingredient
    ${Ingredient}

    type Query {
        GetRecipeById(recipe_id: ID!): Return_GetRecipeById!,
    }

    type Mutation {
        CreateRecipe(createRecipeArgs: Args_CreateRecipe!): ID!
        EditRecipe(editRecipeArgs: Args_EditRecipe!): ID!
        DeleteRecipe(recipe_id: ID!): ID!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`)
