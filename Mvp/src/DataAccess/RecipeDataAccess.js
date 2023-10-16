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

            if(Recipe.length === 0){
                throw new ClientError('Recipe does not exist', 404);
            }

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

            const all_tags = [...new Set(recipeData.tags.concat(recipeData.title.split(' ')))];
            console.log(all_tags)


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
                            tag_nb,
                            ing_nb
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
                                Prisma.sql`${all_tags.length}`,
                                Prisma.sql`${recipeData.ingredients_id.length}`
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
                        all_tags.map((tag) => (
                            Prisma.sql`
                                (
                                    ${
                                        Prisma.join(
                                            [
                                                Prisma.sql`${uuidv4()}`,
                                                Prisma.sql`${type}`,
                                                Prisma.sql`${recipe_id}`,
                                                Prisma.sql`${tag.toLowerCase()}`
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
            console.log(error)
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


    static async getUserRecipes(userId, PageNumber, RowNumber) {
        
        try {
            const Recipes = await prisma.$queryRaw`
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
                    Prisma.sql`WHERE recipe.userid = ${userId}`
                }
                GROUP BY recipe.recipe_id
                ${
                    Prisma.sql`LIMIT ${RowNumber}`
                }
                ${
                    Prisma.sql`OFFSET ${(PageNumber - 1) * RowNumber}`
                }
            `

            if(Recipes.length === 0){
                throw new ClientError(`User doesn't have any recipes`, 404);
            }

            return Recipes;

        } catch (error) {
            throw new AppError("Cannot retrieve user's recipes");
        }

    }
    
    

    static async SearchRecipesByQuery(Query, PageNumber, RowNumber) {
        try {

            const Recipes = await prisma.$queryRaw`

                WITH OrderedRecipesByIng AS (
                    SELECT 
                        refid, 
                        count(*) as c,
                        recipe.tag_nb as rc
                    FROM "cosinaschema2"."Tag" as tag

                    JOIN "cosinaschema2"."Recipe" as recipe
                    ON recipe.recipe_id = tag.refid

                    WHERE  
                            type = 'r'
                        AND
                            tag IN (${
                                Prisma.join(
                                    Query.split(' ').
                                        map((q) => 
                                            Prisma.sql`${q.toLowerCase()}`
                                        )
                                )
                            })
                    GROUP BY refid, rc
                    ORDER BY c DESC, rc
                    ${
                        Prisma.sql`LIMIT ${RowNumber}`
                    }
                    ${
                        Prisma.sql`OFFSET ${(PageNumber - 1) * RowNumber}`
                    }
                )




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
                    array_agg(ing.imageurl) as ingredient_imgurls,
                    orderedByIng.c as relevance
            
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
                INNER JOIN
                    OrderedRecipesByIng as orderedByIng
                ON 
                    orderedByIng.refid = recipe.recipe_id
                GROUP BY recipe.recipe_id, orderedByIng.c, orderedByIng.rc
                ORDER BY 
                    orderedByIng.c DESC,
                    orderedByIng.rc 
            `



            if(Recipes.length === 0){
                throw new ClientError(`No recipes found`, 404);
            }

            return Recipes;

        } catch (error) {
            console.log(error);
            throw new AppError("Cannot retrieve recipes");
        }

    }


    static async SearchRecipesByIng(Ingredients, PageNumber, RowNumber) {
        try {

            const Recipes = await prisma.$queryRaw`
               
                WITH OrderedRecipesByIng AS (
                    SELECT
                        r.recipeid,
                        count(*) as c,
                        recipe.ing_nb as rc
                    FROM "cosinaschema2"."IngredientsOnRecipes" as r

                    JOIN "cosinaschema2"."Recipe" as recipe
                    ON recipe.recipe_id = r.recipeid
                    
                    WHERE ingid IN (
                        ${
                            Prisma.join(
                                Ingredients.map((q) =>
                                    Prisma.sql`${q}`
                                )
                            )
                        }
                    )
                    GROUP BY r.recipeid, rc
                    ORDER BY c DESC, rc
                    ${
                        Prisma.sql`LIMIT ${RowNumber}`
                    }
                    ${
                        Prisma.sql`OFFSET ${(PageNumber - 1) * RowNumber}`
                    }
                )




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
                    array_agg(ing.imageurl) as ingredient_imgurls,
                    orderedByIng.rc
            
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
                INNER JOIN
                    OrderedRecipesByIng as orderedByIng
                ON 
                    orderedByIng.recipeid = recipe.recipe_id
                GROUP BY recipe.recipe_id, orderedByIng.rc, orderedByIng.c
                ORDER BY 
                    orderedByIng.c DESC,
                    orderedByIng.rc 

            `

            if(Recipes.length === 0){
                throw new ClientError(`No recipes found`, 404);
            }

            return Recipes;

        } catch (error) {
            console.log(error);
            throw new AppError("Cannot retrieve recipes");
        }

    }


    static async SearchRecipesByQueryIng(Query, Ingredients, PageNumber, RowNumber) {

        try {

            const Recipes = await prisma.$queryRaw`
                
                --WITH OrderedRecipesByIng AS (
                WITH RecipeCounts AS (
                    SELECT
                        IngRec.recipeid as id,
                        count(DISTINCT IngRec.ingid) as c_ing,
                        count(DISTINCT tag.tag) as c_tag,
                        recipe.ing_nb as ing_c,
                        recipe.tag_nb as tag_c

                    FROM "cosinaschema2"."IngredientsOnRecipes" as IngRec 

                    JOIN "cosinaschema2"."Tag" as tag
                    ON tag.refid = IngRec.recipeid

                    JOIN "cosinaschema2"."Recipe" as recipe
                    ON recipe.recipe_id = IngRec.recipeid
                    
                    WHERE IngRec.ingid IN (
                            ${
                                Prisma.join(
                                    Ingredients.map((q) =>
                                        Prisma.sql`${q}`
                                    )
                                )
                            }
                        )
                        AND
                            tag.type = 'r'
                        AND
                            tag.tag IN (${
                                Prisma.join(
                                    Query.split(' ').
                                        map((q) => 
                                            Prisma.sql`${q.toLowerCase()}`
                                        )
                                )
                            })

                    GROUP BY IngRec.recipeid, recipe.ing_nb, recipe.tag_nb
                    --ORDER BY c_ing DESC, ing_c, c_tag DESC, tag_c

                
                ), 

                OrderedRecipesByIng AS (

                    SELECT id, c_ing, c_tag, ing_c, tag_c, c_ing / ing_c AS rec
                    FROM RecipeCounts
                    ORDER BY rec DESC, c_ing DESC, ing_c, c_tag DESC, tag_c
                    ${
                        Prisma.sql`LIMIT ${RowNumber}`
                    }
                    ${
                        Prisma.sql`OFFSET ${(PageNumber - 1) * RowNumber}`
                    }
                )


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
                INNER JOIN
                    OrderedRecipesByIng as orderedByIng
                ON 
                    orderedByIng.id = recipe.recipe_id

                GROUP BY recipe.recipe_id,
                    orderedByIng.ing_c, 
                    orderedByIng.tag_c, 
                    orderedByIng.c_tag,
                    orderedByIng.c_ing,
                    orderedByIng.rec 
                ORDER BY 
                    orderedByIng.rec DESC,
                    orderedByIng.c_ing DESC,
                    orderedByIng.ing_c,
                    orderedByIng.c_tag DESC,
                    orderedByIng.tag_c
                

            `

            //console.log(Recipes);
            //console.log(Recipes.map((r) => r.wow));

            if(Recipes.length === 0){
                throw new ClientError(`No recipes found`, 404);
            }

            return Recipes;

        } catch (error) {
            console.log(error);
            throw new AppError("Cannot retrieve recipes");
        }


    }


}



module.exports = RecipeDataAccess;