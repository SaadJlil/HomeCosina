const prisma = require('../Config/Prisma')
const AppError = require('../Exceptions/AppError');
const ClientError = require('../Exceptions/ClientError');
const { Prisma } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid');
const { Ingredient } = require('../graphql/typeDefs/IngredientType');
const ImageDataAccess = require('./../DataAccess/ImageDataAccess');



class IngredientDataAccess{

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
                    main_imageurl as ing_imageurl
                FROM 
                    "cosinaschema2"."Ingredient" as ing
                ${
                    Prisma.sql`WHERE ing.ingredient_name = ${Ingredient_name}`
                }
            `
            if(Ingredient.length == 0){
                throw new ClientError('Ingredient does not exist', 404);
            }

            return { 
                ...Ingredient[0]
            };

        } catch (error) {
            throw new AppError("Cannot retrieve the ingredient");
        }

    }


    static async SearchIngredientsByQuery(Query, PageNumber, RowNumber) {
        try {


            const type = 'i';

            const Ingredients = await prisma.$queryRaw`

                SELECT
                    ing.ingredient_name,
                    ing.calories, total_fat,
                    ing.sat_fat,
                    ing.protein,
                    ing.sodium,
                    ing.potassium,
                    ing.cholesterol,
                    ing.carbohydrates,
                    ing.fiber,
                    ing.sugar,
                    ing.category,
                    ing.thumbnail_imageurl as ing_imageurl

                FROM "cosinaschema2"."Tag" as tag

                JOIN "cosinaschema2"."Ingredient" as ing 
                ON ing.ingredient_name = tag.refid

                ${
                    Prisma.sql`WHERE 
                        tag.type = ${type}
                            AND
                        (
                            tag.ts @@ phraseto_tsquery('english', ${Query})
                                OR 
                            levenshtein(SUBSTRING(ing.ingredient_name, 1, CAST(${Query.length + 1} AS INTEGER)), ${Query}) < 3
                        )
                            AND   
                        LENGTH(ing.ingredient_name) >= CAST(${Query.length} AS INTEGER)
                    `
                }
                
                ORDER BY levenshtein(SUBSTRING(ing.ingredient_name, 1, CAST(${Query.length + 1} AS INTEGER)), ${Query}),
                    CHAR_LENGTH(ing.ingredient_name) 


                ${
                    Prisma.sql`LIMIT ${RowNumber}`
                }
                ${
                    Prisma.sql`OFFSET ${(PageNumber - 1) * RowNumber}`
                }

            `

            if(Ingredients.length === 0){
                throw new ClientError(`No ingredients found`, 404);
            }


            return Ingredients.map((Ingredient) => 
                (
                    { 
                        ...Ingredient, 
                    }
                )
            );

        } catch (error) {
            console.log(error);
            throw new AppError("Cannot retrieve Ingredients");
        }

    }




}


module.exports = IngredientDataAccess;