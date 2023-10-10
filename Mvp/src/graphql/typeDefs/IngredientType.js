
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


module.exports = Ingredient;

