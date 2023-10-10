const AppError = require('./../Exceptions/AppError');
const ClientError = require('./../Exceptions/ClientError');
const prisma = require('./../Config/Prisma')
const { Prisma } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid');



class RecipeDataAccess{
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
    static async getRecipeById(id) {
        
        try {
            const Recipe = await prisma.$queryRaw`
                SELECT
                    recipe_id,
                    steps,
                    date,
                    userid,
                    title,
                    link,
                    cookingtime_min,
                    views,
                    votes,
                    recipe.imageurl as recipe_imgurl,
                    array_agg(presentedstring) presentedstring,
                    array_agg(unit) as unit,
                    array_agg(value) as value,
                    array_agg(valueingram) as valueingram,
                    array_agg(ingredient_name) as ingredient_name,
                    array_agg(calories) as calories,
                    array_agg(total_fat) as total_fat,
                    array_agg(sat_fat) as sat_fat,
                    array_agg(protein) as protein,
                    array_agg(sodium) as sodium,
                    array_agg(potassium) as potassium,
                    array_agg(cholesterol) as cholestrol,
                    array_agg(carbohydrates) as carbohydrates,
                    array_agg(fiber) as fiber,
                    array_agg(sugar) as sugar,
                    array_agg(category) category,
                    array_agg(ing.imageurl) as ingredient_imgurls
            
                FROM 
                    "cosinaschema2"."Recipe" as recipe
                LEFT JOIN 
                    "cosinaschema2"."IngredientsOnRecipes" as recing 
                ON 
                    recipe.recipe_id = recing.recipeid
                INNER JOIN
                    "cosinaschema2"."Ingredient" as ing
                ON 
                    recing.ingid = ing.ingredient_name
                ${
                    Prisma.sql`WHERE recipe.recipe_id = ${id}`
                }
                GROUP BY recipe.recipe_id
            `
            return Recipe[0];

        } catch (error) {
            throw new AppError("Cannot retrieve the recipe");
        }

    }

    static async createRecipe(recipeData, userId) {
        try {
            //const recipe_id = uuidv4();
            const recipe_id = "b0284468-8e4d-4450-ada2-f8816c614328";
            
            const type = 'recipe'
            const measurements = [];
            
            for (let i = 0; i < recipeData.ingredients_id.length; i++) {
                measurements.push({
                    ing_id: recipeData.ingredients_id[i],
                    presentedstring: '',
                    unit: recipeData.units[i],
                    value: recipeData.values[i],
                    valueingram: recipeData.valuesingram[i]
                });

            }

            const regEx_onlyLettersAndSpace = /^[A-Za-z\s]*$/;

            const ingsExistQuery = `DO $$ 
                DECLARE
                    ing_ids TEXT[] := ARRAY[${
                        recipeData.ingredients_id.map(
                            (id) => {
                                if(regEx_onlyLettersAndSpace.test(id))
                                    return `'${id}'`
                                throw new ClientError('One or multiple recipes do not exist', 400);
                            }
                        ).join(',')
                    }];
                    ing_id TEXT;
                BEGIN
                    FOREACH ing_id IN ARRAY ing_ids 
                    LOOP
                        IF NOT EXISTS (SELECT 1 FROM "cosinaschema2"."Ingredient" WHERE ing_id = ingredient_name LIMIT 1) THEN
                            RAISE EXCEPTION 'Ingredient ID % does not exist in the table', ing_id;
                    END IF;
                END LOOP;
            END $$;`;



            await prisma.$transaction([
                prisma.$executeRawUnsafe(ingsExistQuery),
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."Recipe" (
                            recipe_id,
                            title,
                            userid,
                            imageurl,
                            steps,
                            cookingtime_min,
                            link
                        )
                    VALUES (
                            ${Prisma.join([   
                                Prisma.sql`${recipe_id}`,
                                Prisma.sql`${recipeData.title}`,
                                Prisma.sql`${userId}`,
                                Prisma.sql`${recipeData.recipe_imgurl}`,
                                Prisma.sql`ARRAY[${Prisma.join(recipeData.steps)}]`,
                                Prisma.sql`${recipeData.cookingtime_min}`,
                                Prisma.sql`ARRAY[${Prisma.join(recipeData.link)}]`,
                           ])}
                        )
                `,
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."IngredientsOnRecipes" (
                            recipeid,
                            ingid,
                            presentedstring,
                            unit,
                            value,
                            valueingram
                        )
                    VALUES ${
                        Prisma.join(
                            measurements.map((measurement) => (
                                Prisma.sql`
                                    (
                                        ${
                                            Prisma.join(
                                                [
                                                    Prisma.sql`${recipe_id}`,
                                                    Prisma.sql`${measurement.ing_id}`,
                                                    Prisma.sql`${measurement.presentedstring}`,
                                                    Prisma.sql`${measurement.unit}`,
                                                    Prisma.sql`${measurement.value}`,
                                                    Prisma.sql`${measurement.valueingram}`
                                                ]
                                            )
                                        }
                                    )`
                                )
                            )
                        )
                    }
                            
                `,
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."Tag" (
                            tag_id,
                            type,
                            refid,
                            tag
                        )
                    VALUES ${Prisma.join(
                        recipeData.tags.map((tag) => (
                            Prisma.sql`
                                (
                                    ${
                                        Prisma.join(
                                            [
                                                Prisma.sql`${uuidv4()}`,
                                                Prisma.sql`${type}`,
                                                Prisma.sql`${recipe_id}`,
                                                Prisma.sql`${tag}`
                                            ]
                                        )
                                    }
                                )`
                            )
                        )
                    )}
                `
            ]);

            return recipe_id;

        } catch (error) {
            throw new AppError("Cannot upload the recipe");
        }
    }

    

    static async deleteRecipeById(recipe_id, userId) {
        try{

            const recipeUserExists = `DO $$ 
                DECLARE
                    recid TEXT := '${recipe_id}';
                    usrid TEXT := '${userId}';
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM "cosinaschema2"."Recipe" WHERE recid = recipe_id AND usrid = userId LIMIT 1) THEN
                        RAISE EXCEPTION 'Recipe ID % does not exist in the table', recid;
                    END IF;
                END $$;
            `;

            await prisma.$transaction([
                prisma.$executeRawUnsafe(recipeUserExists),
                prisma.$executeRaw`
                    DELETE FROM 
                        "cosinaschema2"."Tag" as tag_
                    ${
                        Prisma.sql`WHERE tag_.refid = ${recipe_id}`
                    }
                `,
                prisma.$executeRaw`
                    DELETE FROM 
                        "cosinaschema2"."IngredientsOnRecipes" as rec_ing
                    ${
                        Prisma.sql`WHERE rec_ing.recipeid = ${recipe_id}`
                    }
                `,
                prisma.$executeRaw`
                    DELETE FROM 
                        "cosinaschema2"."Recipe" as recipe
                    ${
                        Prisma.sql`WHERE recipe.recipe_id = ${recipe_id}`
                    }
                `
                
            ])
           
        }
        catch(err){
            throw new AppError("Cannot delete the recipe");
        }

    }


    static async editRecipeById(recipeData, userId) {
        try{

            const recipe = await RecipeDataAccess.getRecipeById(recipeData.recipe_id);

            if(recipe.userid !== userId){
                throw new ClientError('Permission to edit the recipe is not granted', 401)
            }

            const preservedData = {
                recipe_id: recipeData.recipe_id,
                date: recipe.date,
                views: recipe.views,
                votes: recipe.votes
            }

            await RecipeDataAccess.deleteRecipeById(recipeData.recipe_id, userId);

            const recipe_id = recipeData.recipe_id;
            
            const type = 'recipe'
            const measurements = [];
            
            for (let i = 0; i < recipeData.ingredients_id.length; i++) {
                measurements.push({
                    ing_id: recipeData.ingredients_id[i],
                    presentedstring: '',
                    unit: recipeData.units[i],
                    value: recipeData.values[i],
                    valueingram: recipeData.valuesingram[i]
                });

            }

            const regEx_onlyLettersAndSpace = /^[A-Za-z\s]*$/;

            const ingsExistQuery = `DO $$ 
                DECLARE
                    ing_ids TEXT[] := ARRAY[${
                        recipeData.ingredients_id.map(
                            (id) => {
                                if(regEx_onlyLettersAndSpace.test(id))
                                    return `'${id}'`
                                throw new ClientError('One or multiple recipes do not exist', 400);
                            }
                        ).join(',')
                    }];
                    ing_id TEXT;
                BEGIN
                    FOREACH ing_id IN ARRAY ing_ids 
                    LOOP
                        IF NOT EXISTS (SELECT 1 FROM "cosinaschema2"."Ingredient" WHERE ing_id = ingredient_name LIMIT 1) THEN
                            RAISE EXCEPTION 'Ingredient ID % does not exist in the table', ing_id;
                    END IF;
                END LOOP;
            END $$;`;



            await prisma.$transaction([
                prisma.$executeRawUnsafe(ingsExistQuery),
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."Recipe" (
                            recipe_id,
                            title,
                            userid,
                            imageurl,
                            steps,
                            cookingtime_min,
                            link,
                            date,
                            views,
                            votes
                        )
                    VALUES (
                            ${Prisma.join([   
                                Prisma.sql`${recipe_id}`,
                                Prisma.sql`${recipeData.title}`,
                                Prisma.sql`${userId}`,
                                Prisma.sql`${recipeData.recipe_imgurl}`,
                                Prisma.sql`ARRAY[${Prisma.join(recipeData.steps)}]`,
                                Prisma.sql`${recipeData.cookingtime_min}`,
                                Prisma.sql`ARRAY[${Prisma.join(recipeData.link)}]`,
                                Prisma.sql`${preservedData.date}`,
                                Prisma.sql`${preservedData.views}`,
                                Prisma.sql`${preservedData.votes}`
                           ])}
                        )
                `,
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."IngredientsOnRecipes" (
                            recipeid,
                            ingid,
                            presentedstring,
                            unit,
                            value,
                            valueingram
                        )
                    VALUES ${
                        Prisma.join(
                            measurements.map((measurement) => (
                                Prisma.sql`
                                    (
                                        ${
                                            Prisma.join(
                                                [
                                                    Prisma.sql`${recipe_id}`,
                                                    Prisma.sql`${measurement.ing_id}`,
                                                    Prisma.sql`${measurement.presentedstring}`,
                                                    Prisma.sql`${measurement.unit}`,
                                                    Prisma.sql`${measurement.value}`,
                                                    Prisma.sql`${measurement.valueingram}`
                                                ]
                                            )
                                        }
                                    )`
                                )
                            )
                        )
                    }
                            
                `,
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."Tag" (
                            tag_id,
                            type,
                            refid,
                            tag
                        )
                    VALUES ${Prisma.join(
                        recipeData.tags.map((tag) => (
                            Prisma.sql`
                                (
                                    ${
                                        Prisma.join(
                                            [
                                                Prisma.sql`${uuidv4()}`,
                                                Prisma.sql`${type}`,
                                                Prisma.sql`${recipe_id}`,
                                                Prisma.sql`${tag}`
                                            ]
                                        )
                                    }
                                )`
                            )
                        )
                    )}
                `
            ]);

            return recipe_id;


        }
        catch(error){
            throw new AppError("Cannot edit the recipe");
        }
    }


}


module.exports = RecipeDataAccess;