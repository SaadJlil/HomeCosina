
const Ingredient = `#graphql
    type Ingredient {
        name: String!
        calories: Float!
        total_fat: Float!
        sat_fat: Float!
        protein: Float!
        sodium: Float!
        potassium: Float!
        cholesterol: Float!
        carbohydrates: Float!
        fiber: Float!
        sugar: Float!
        category: String!
        imageurl: String
    }
`

const GetIngredientByIdType = `#graphql
    type Return_GetIngredientById {

        #ingredient data
        ingredient_name: String!
        imageurl: String
        calories: Float!
        total_fat: Float!
        sat_fat: Float!
        protein: Float!
        sodium: Float!
        potassium: Float!
        cholestrol: Float!
        carbohydrates: Float!
        fiber: Float!
        sugar: Float!
        category: Float!

    }
`



module.exports = {
    Ingredient,
    GetIngredientByIdType
};

