const AppError = require('../Exceptions/AppError');
const ClientError = require('../Exceptions/ClientError');
const prisma = require('../Config/Prisma')
const { Prisma } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid');
const { Ingredient } = require('../graphql/typeDefs/IngredientType');



class IngredientDataAccess{
/*
        const sortingClause =
        sort === SortOptions.LowHigh ?
        prisma.sql`ORDER BY "price" ASC` :
        prisma.sql`ORDER BY "price" DESC`;
     const assets = await prisma.$queryRaw`
      SELECT
        "id",
        "name",
        "description",
        "date",
        "price",
      FROM
        "Asset"
      ORDER BY
        ${sortingClause}`

*/
    static async getIngredientById(Ingredient_name) {
        try {

            const Ingredient = await prisma.$queryRaw`
                SELECT
                    ingredient_name,
                    calories, total_fat,
                    sat_fat,
                    protein,
                    sodium,
                    potassium,
                    cholesterol,
                    carbohydrates,
                    fiber,
                    sugar,
                    category,
                    imageurl
                FROM 
                    "cosinaschema2"."Ingredient" as ing
                ${
                    Prisma.sql`WHERE ing.ingredient_name = ${Ingredient_name}`
                }
            `
            if(Ingredient.length == 0){
                throw new ClientError('Ingredient does not exist', 404);
            }

            return Ingredient[0];

        } catch (error) {
            throw new AppError("Cannot retrieve the ingredient");
        }

    }

}


module.exports = IngredientDataAccess;