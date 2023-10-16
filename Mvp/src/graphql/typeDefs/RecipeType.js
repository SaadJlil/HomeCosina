
const Recipe = `#graphql
    type Recipe {
        recipe_id: ID!
        steps: [String!]!
        date: String!
        userid: ID!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        imageurl: String
    }
`

const GetRecipeByIdType = `#graphql
    type Return_GetRecipeById {

        #ingredient data
        ing_imgurl: [String]
        presentedstring: [String!],
        unit: [String],
        value: [Int],
        valueingram: [Float],
        ingredient_name: [String!]!,
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!

        #recipe data
        #recipe_id: ID!
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: [String]

    }
`

const GetUserRecipesType = `#graphql
    type Return_GetUserRecipes {

        #ingredient data
        ing_imgurl: [String]
        presentedstring: [String!]
        unit: [String]
        value: [Int]
        valueingram: [Float]
        ingredient_name: [String!]!
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!

        #recipe data
        #recipe_id: ID!
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: [String]

    }
`

const CreateRecipeType = `#graphql
    input Args_CreateRecipe{
        steps: [String!]!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        recipe_imageurl: String

        ingredients_id: [ID!]!

        tags: [String!]

        units: [String!]!
        values: [Int!]!
        valuesingram: [Float!]!

    }
`

const EditRecipeType = `#graphql
    input Args_EditRecipe{
        recipe_id: ID!
        steps: [String!]!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        recipe_imageurl: String

        ingredients_id: [ID!]!

        tags: [String!]

        units: [String!]!
        values: [Int!]!
        valuesingram: [Float!]!

    }
`

const SearchRecipesType = `#graphql
    type Return_SearchRecipes {

        #ingredient data
        ing_imgurl: [String]
        presentedstring: [String!]
        unit: [String]
        value: [Int]
        valueingram: [Float]
        ingredient_name: [String!]!
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!

        #recipe data
        #recipe_id: ID!
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: [String]

    }
`




module.exports = {
    Recipe,
    GetRecipeByIdType,
    CreateRecipeType,
    EditRecipeType,
    GetUserRecipesType,
    SearchRecipesType
};

