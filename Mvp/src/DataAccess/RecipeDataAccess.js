const AppError = require('./../Exceptions/AppError');
const ClientError = require('./../Exceptions/ClientError');
const prisma = require('./../Config/Prisma');
const { Prisma } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const ImageDataAccess = require('./../DataAccess/ImageDataAccess');
const B2 = require('backblaze-b2');
const sharp = require('sharp');
const imageConfig = require('./../Config/image');



class RecipeDataAccess{
    static async getRecipeById(id) {
        
        try {
            const Recipe = await prisma.$queryRaw`
                SELECT
                    recipe_id,
                    steps,
                    date,
                    recipe.userid,
                    title,
                    link,
                    cookingtime_min,
                    views,
                    votes,
                    recipe.main_imageurl as recipe_imgurl,
                    recipe.thumbnail_imageurl as thumbnail_recipe_imgurl,


                    recipe.calories as r_calories, 
                    recipe.total_fat as r_total_fat,
                    recipe.sat_fat as r_sat_fat,
                    recipe.protein as r_protein,
                    recipe.sodium as r_sodium,
                    recipe.potassium as r_potassium,
                    recipe.cholesterol as r_cholesterol,
                    recipe.carbohydrates as r_carbohydrates,
                    recipe.fiber as r_fiber,
                    recipe.sugar as r_sugar,

             
                    array_agg(presentedstring) as presentedstring,
                    array_agg(unit) as unit,
                    array_agg(value) as value,
                    array_agg(valueingram) as valueingram,
                    array_agg(ingredient_name) as ingredient_name,
                    array_agg(ing.calories) as calories,
                    array_agg(ing.total_fat) as total_fat,
                    array_agg(ing.sat_fat) as sat_fat,
                    array_agg(ing.protein) as protein,
                    array_agg(ing.sodium) as sodium,
                    array_agg(ing.potassium) as potassium,
                    array_agg(ing.cholesterol) as cholestrol,
                    array_agg(ing.carbohydrates) as carbohydrates,
                    array_agg(ing.fiber) as fiber,
                    array_agg(ing.sugar) as sugar,
                    array_agg(ing.category) category,
                    array_agg(ing.thumbnail_imageurl) as ingredient_imgurls,

                    recipe.votes as votes,
                    recipe.views as views
            
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
                LIMIT 1
            `


            if(Recipe.length === 0){
                throw new ClientError('Recipe does not exist', 404);
            }

            new Promise((resolve, reject) => {
                prisma.$executeRaw`
                    UPDATE "cosinaschema2"."Recipe" as recipe
                    SET views = recipe.views + 1
                    FROM "cosinaschema2"."Recipe" as src_recipe
                    ${
                        Prisma.sql`WHERE recipe.recipe_id = ${id}`
                    }
                `
                .catch(error => {
                    //Add log
                })
            })



            return { 
                ...Recipe[0]
            };

        } catch (error) {
            throw new AppError("Cannot retrieve the recipe");
        }

    }

    static async createRecipe(recipeData, userId) {
        try {

            var mainImageUrl = '';
            var thumbnailImageUrl = '';

            const recipe_id = uuidv4();

            if(!!recipeData.image){
                try{

                    const base64Image = recipeData.image.split(',')[1]; 


                    const buffer = Buffer.from(base64Image, 'base64');
                    

                    const thumbnail_= await sharp(buffer)
                        .resize({ width: imageConfig.thumbnailWidth, height: imageConfig.thumbnailWidth})
                        .toBuffer();
                    
                    
                    
                    const thumbnailImage = thumbnail_.toString('base64');


                    mainImageUrl = await ImageDataAccess.StoreImage(recipe_id, base64Image, true, false);
                    thumbnailImageUrl = await ImageDataAccess.StoreImage(recipe_id, thumbnailImage, true, true);

                }catch(err){
                    throw AppError("Cannot upload image", 500);
                }
            }


            try{

                const type = 'r'
                const measurements = [];

                for (let i = 0; i < recipeData.ingredients_id.length; i++) {
                    measurements.push({
                        ing_id: recipeData.ingredients_id[i],
                        presentedstring: `${recipeData.values[i]} ${recipeData.units[i]}`,
                        unit: recipeData.units[i],
                        value: recipeData.values[i],
                        valueingram: recipeData.valuesingram[i]
                    });

                }


                const all_tags = [...new Set(recipeData.tags.concat(recipeData.title.split(' ')))];


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
                                steps,
                                cookingtime_min,
                                link,
                                tag_nb,
                                ing_nb,
                                main_imageurl,
                                thumbnail_imageurl
                            )
                        VALUES (
                                ${Prisma.join([   
                                    Prisma.sql`${recipe_id}`,
                                    Prisma.sql`${recipeData.title.toLowerCase()}`,
                                    Prisma.sql`${userId}`,
                                    Prisma.sql`ARRAY[${Prisma.join(recipeData.steps)}]`,
                                    Prisma.sql`${recipeData.cookingtime_min}`,
                                    Prisma.sql`ARRAY[${Prisma.join(recipeData.link)}]`,
                                    Prisma.sql`${all_tags.length}`,
                                    Prisma.sql`${recipeData.ingredients_id.length}`,
                                    Prisma.sql`${mainImageUrl}`,
                                    Prisma.sql`${thumbnailImageUrl}`
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
                    `,
                    prisma.$executeRaw`

                        WITH RecipeNutrition AS (
                            SELECT
                                ingrec.recipeid,
                                SUM(ingrec.valueingram * ing.calories) / SUM(ingrec.valueingram) AS calories,
                                SUM(ingrec.valueingram * ing.total_fat) / SUM(ingrec.valueingram) AS total_fat,
                                SUM(ingrec.valueingram * ing.sat_fat) / SUM(ingrec.valueingram) AS sat_fat,
                                SUM(ingrec.valueingram * ing.protein) / SUM(ingrec.valueingram) AS protein,
                                SUM(ingrec.valueingram * ing.sodium) / SUM(ingrec.valueingram) AS sodium,
                                SUM(ingrec.valueingram * ing.potassium) / SUM(ingrec.valueingram) AS potassium,
                                SUM(ingrec.valueingram * ing.cholesterol) / SUM(ingrec.valueingram) AS cholesterol,
                                SUM(ingrec.valueingram * ing.carbohydrates) / SUM(ingrec.valueingram) AS carbohydrates,
                                SUM(ingrec.valueingram * ing.fiber) / SUM(ingrec.valueingram) AS fiber,
                                SUM(ingrec.valueingram * ing.sugar) / SUM(ingrec.valueingram) AS sugar
                            FROM
                                "cosinaschema2"."IngredientsOnRecipes" AS ingrec
                            INNER JOIN
                                "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
                            ${
                                Prisma.sql`WHERE 
                                    ingrec.recipeid = ${recipe_id}
                                `
                            }
                            GROUP BY
                                ingrec.recipeid
                        )
                        UPDATE "cosinaschema2"."Recipe" AS recipe
                        SET
                            calories = RecipeNutrition.calories,
                            total_fat = RecipeNutrition.total_fat,
                            sat_fat = RecipeNutrition.sat_fat,
                            protein = RecipeNutrition.protein,
                            sodium = RecipeNutrition.sodium,
                            potassium = RecipeNutrition.potassium,
                            cholesterol = RecipeNutrition.cholesterol,
                            carbohydrates = RecipeNutrition.carbohydrates,
                            fiber = RecipeNutrition.fiber,
                            sugar = RecipeNutrition.sugar
                        FROM
                            RecipeNutrition
                        WHERE
                            recipe.recipe_id = RecipeNutrition.recipeid
                            AND EXISTS (
                                SELECT 1
                                FROM "cosinaschema2"."IngredientsOnRecipes" AS ingrec
                                WHERE ingrec.recipeid = recipe.recipe_id
                            )

                    `
                ]);

                return recipe_id;

            } catch(err) {
                await ImageDataAccess.DeleteImage(recipeData.recipe_id, true);
                throw err;
            }
            

        } catch (error) {
            throw new AppError("Cannot upload the recipe");
        }
    }

    

    static async deleteRecipeById(recipe_id, userId, deleteImage = false) {
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
            if(deleteImage){
                try{
                    ImageDataAccess.DeleteImage(recipe_id, true);
                }catch(err){}
            }
          
        }
        catch(err){
            throw new AppError("Cannot delete the recipe");
        }

    }


    static async editRecipeById(recipeData, userId) {
        try{

            const recipe_id = recipeData.recipe_id;

            const recipe = await RecipeDataAccess.getRecipeById(recipe_id);

            if(recipe.userid !== userId){
                throw new ClientError('Permission to edit the recipe is not granted', 401)
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

            try{
                await prisma.$executeRawUnsafe(ingsExistQuery);
            }
            catch(err){
                throw new ClientError("One or multiple ingredients couldn't be found", 400);
            }


            const preservedData = {
                recipe_id: recipe_id,
                date: recipe.date,
                views: recipe.views,
                votes: recipe.votes,
                main_imageurl: recipe.recipe_imgurl,
                thumbnail_imageurl: recipe.thumbnail_recipe_imgurl
            }

            await RecipeDataAccess.deleteRecipeById(recipe_id, userId, false);

            if(!!recipeData.image){
                try{
                    try{
                        await ImageDataAccess.DeleteImage(Id, true);
                    }
                    catch(err){}

                    const base64Image = recipeData.image.split(',')[1]; 

                    const buffer = Buffer.from(base64Image, 'base64');
                    

                    const thumbnail_ = await sharp(buffer)
                        .resize({ width: imageConfig.thumbnailWidth, height: imageConfig.thumbnailWidth})
                        .toBuffer();
                    
                    
                    
                    const thumbnailImage = thumbnail_.toString('base64');

                    if(!!recipeData.image){
                        try{
                            preservedData.main_imageurl = await ImageDataAccess.StoreImage(recipe_id, base64Image, true, false);
                            preservedData.thumbnail_imageurl = await ImageDataAccess.StoreImage(recipe_id, thumbnailImage, true, true);
                        }catch(err){
                            throw AppError("Cannot upload image", 500);
                        }
                    }

                }catch(err){
                    throw AppError("Cannot upload update recipe image", 500);
                }
            }




            
            const type = 'r'
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




            await prisma.$transaction([
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."Recipe" (
                            recipe_id,
                            title,
                            userid,
                            steps,
                            cookingtime_min,
                            link,
                            date,
                            views,
                            votes,
                            tag_nb,
                            ing_nb,
                            main_imageurl,
                            thumbnail_imageurl
                        )
                    VALUES (
                            ${Prisma.join([   
                                Prisma.sql`${recipe_id}`,
                                Prisma.sql`${recipeData.title}`,
                                Prisma.sql`${userId}`,
                                Prisma.sql`ARRAY[${Prisma.join(recipeData.steps)}]`,
                                Prisma.sql`${recipeData.cookingtime_min}`,
                                Prisma.sql`ARRAY[${Prisma.join(recipeData.link)}]`,
                                Prisma.sql`${preservedData.date}`,
                                Prisma.sql`${preservedData.views}`,
                                Prisma.sql`${preservedData.votes}`,
                                Prisma.sql`${all_tags.length}`,
                                Prisma.sql`${measurements.length}`,
                                Prisma.sql`${preservedData.main_imageurl}`,
                                Prisma.sql`${preservedData.thumbnail_imageurl}`
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
                `,

                prisma.$executeRaw`

                    WITH RecipeNutrition AS (
                            SELECT
                                ingrec.recipeid,
                                SUM(ingrec.valueingram * ing.calories) / SUM(ingrec.valueingram) AS calories,
                                SUM(ingrec.valueingram * ing.total_fat) / SUM(ingrec.valueingram) AS total_fat,
                                SUM(ingrec.valueingram * ing.sat_fat) / SUM(ingrec.valueingram) AS sat_fat,
                                SUM(ingrec.valueingram * ing.protein) / SUM(ingrec.valueingram) AS protein,
                                SUM(ingrec.valueingram * ing.sodium) / SUM(ingrec.valueingram) AS sodium,
                                SUM(ingrec.valueingram * ing.potassium) / SUM(ingrec.valueingram) AS potassium,
                                SUM(ingrec.valueingram * ing.cholesterol) / SUM(ingrec.valueingram) AS cholesterol,
                                SUM(ingrec.valueingram * ing.carbohydrates) / SUM(ingrec.valueingram) AS carbohydrates,
                                SUM(ingrec.valueingram * ing.fiber) / SUM(ingrec.valueingram) AS fiber,
                                SUM(ingrec.valueingram * ing.sugar) / SUM(ingrec.valueingram) AS sugar
                            FROM
                                "cosinaschema2"."IngredientsOnRecipes" AS ingrec
                            INNER JOIN
                                "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
                            ${
                                Prisma.sql`WHERE 
                                    ingrec.recipeid = ${recipe_id}
                                `
                            }
                            GROUP BY
                                ingrec.recipeid
                        )
                        UPDATE "cosinaschema2"."Recipe" AS recipe
                        SET
                            calories = RecipeNutrition.calories,
                            total_fat = RecipeNutrition.total_fat,
                            sat_fat = RecipeNutrition.sat_fat,
                            protein = RecipeNutrition.protein,
                            sodium = RecipeNutrition.sodium,
                            potassium = RecipeNutrition.potassium,
                            cholesterol = RecipeNutrition.cholesterol,
                            carbohydrates = RecipeNutrition.carbohydrates,
                            fiber = RecipeNutrition.fiber,
                            sugar = RecipeNutrition.sugar
                        FROM
                            RecipeNutrition
                        WHERE
                            recipe.recipe_id = RecipeNutrition.recipeid
                            AND EXISTS (
                                SELECT 1
                                FROM "cosinaschema2"."IngredientsOnRecipes" AS ingrec
                                WHERE ingrec.recipeid = recipe.recipe_id
                            )

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
                    recipe.thumbnail_imageurl as recipe_imgurl,

                    recipe.calories as r_calories, 
                    recipe.total_fat as r_total_fat,
                    recipe.sat_fat as r_sat_fat,
                    recipe.protein as r_protein,
                    recipe.sodium as r_sodium,
                    recipe.potassium as r_potassium,
                    recipe.cholesterol as r_cholesterol,
                    recipe.carbohydrates as r_carbohydrates,
                    recipe.fiber as r_fiber,
                    recipe.sugar as r_sugar,

                    array_agg(presentedstring) presentedstring,
                    array_agg(unit) as unit,
                    array_agg(value) as value,
                    array_agg(valueingram) as valueingram,
                    array_agg(ingredient_name) as ingredient_name,
                    array_agg(ing.calories) as calories,
                    array_agg(ing.total_fat) as total_fat,
                    array_agg(ing.sat_fat) as sat_fat,
                    array_agg(ing.protein) as protein,
                    array_agg(ing.sodium) as sodium,
                    array_agg(ing.potassium) as potassium,
                    array_agg(ing.cholesterol) as cholestrol,
                    array_agg(ing.carbohydrates) as carbohydrates,
                    array_agg(ing.fiber) as fiber,
                    array_agg(ing.sugar) as sugar,
                    array_agg(category) category,
                    array_agg(ing.thumbnail_imageurl) as ingredient_imgurls,

                    recipe.votes as votes
            
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

            return Recipes.map((Recipe) => 
                (
                    { 
                        ...Recipe
                    }
                )
            );

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
                    recipe.thumbnail_imageurl as recipe_imgurl,

                    recipe.calories as r_calories, 
                    recipe.total_fat as r_total_fat,
                    recipe.sat_fat as r_sat_fat,
                    recipe.protein as r_protein,
                    recipe.sodium as r_sodium,
                    recipe.potassium as r_potassium,
                    recipe.cholesterol as r_cholesterol,
                    recipe.carbohydrates as r_carbohydrates,
                    recipe.fiber as r_fiber,
                    recipe.sugar as r_sugar,

                    array_agg(presentedstring) presentedstring,
                    array_agg(unit) as unit,
                    array_agg(value) as value,
                    array_agg(valueingram) as valueingram,
                    array_agg(ingredient_name) as ingredient_name,
                    array_agg(ing.calories) as calories,
                    array_agg(ing.total_fat) as total_fat,
                    array_agg(ing.sat_fat) as sat_fat,
                    array_agg(ing.protein) as protein,
                    array_agg(ing.sodium) as sodium,
                    array_agg(ing.potassium) as potassium,
                    array_agg(ing.cholesterol) as cholestrol,
                    array_agg(ing.carbohydrates) as carbohydrates,
                    array_agg(ing.fiber) as fiber,
                    array_agg(ing.sugar) as sugar,
                    array_agg(category) category,
                    array_agg(ing.thumbnail_imageurl) as ingredient_imgurls,
                    orderedByIng.c as relevance,

                    recipe.votes as votes
            
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


            return Recipes.map((Recipe) => 
                (
                    { 
                        ...Recipe
                    }
                )
            );

        } catch (error) {
            throw new AppError("Cannot retrieve recipes");
        }

    }


    static async SearchRecipesByIng(Ingredients, PageNumber, RowNumber) {
        try {

            const defaultIngredients = ['water', 'salt', 'pepper'];
            const FilteredIngredients = [...new Set(Ingredients)];
            const AllIngredients = [...new Set([...FilteredIngredients, ...defaultIngredients])];

            const Recipes = await prisma.$queryRaw`

                WITH RecipeCounts AS (
                    SELECT
                        IngRec.recipeid as id,
                        COUNT(1) as A,
                        COUNT(CASE WHEN IngRec.ingid IN (${
                                    Prisma.join(
                                        FilteredIngredients.map((q) =>
                                            Prisma.sql`${q}`
                                        )
                                    )
                                }) THEN 1 END) AS N,
                        recipe.ing_nb as T 

                    FROM "cosinaschema2"."IngredientsOnRecipes" as IngRec

                    JOIN "cosinaschema2"."Recipe" as recipe
                    ON recipe.recipe_id = IngRec.recipeid


                    WHERE (IngRec.ingid IN (
                                ${
                                    Prisma.join(
                                        AllIngredients.map((q) =>
                                            Prisma.sql`${q}`
                                        )
                                    )
                                }
                            )
                        )

                    GROUP BY id, T 
                    
                ),

                OrderedRecipesByIng AS (

                    SELECT id, A, N, (T - A) AS rc
                    FROM RecipeCounts
                    ORDER BY rc ASC, N DESC, A DESC
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
                    recipe.thumbnail_imageurl as recipe_imgurl,

                    recipe.calories as r_calories, 
                    recipe.total_fat as r_total_fat,
                    recipe.sat_fat as r_sat_fat,
                    recipe.protein as r_protein,
                    recipe.sodium as r_sodium,
                    recipe.potassium as r_potassium,
                    recipe.cholesterol as r_cholesterol,
                    recipe.carbohydrates as r_carbohydrates,
                    recipe.fiber as r_fiber,
                    recipe.sugar as r_sugar,

                    array_agg(presentedstring) presentedstring,
                    array_agg(unit) as unit,
                    array_agg(value) as value,
                    array_agg(valueingram) as valueingram,
                    array_agg(ingredient_name) as ingredient_name,
                    array_agg(ing.calories) as calories,
                    array_agg(ing.total_fat) as total_fat,
                    array_agg(ing.sat_fat) as sat_fat,
                    array_agg(ing.protein) as protein,
                    array_agg(ing.sodium) as sodium,
                    array_agg(ing.potassium) as potassium,
                    array_agg(ing.cholesterol) as cholestrol,
                    array_agg(ing.carbohydrates) as carbohydrates,
                    array_agg(ing.fiber) as fiber,
                    array_agg(ing.sugar) as sugar,
                    array_agg(category) category,
                    array_agg(ing.thumbnail_imageurl) as ingredient_imgurls,
                    recipe.votes as votes,
                    orderedByIng.rc,
                    orderedByIng.N
            
                FROM 
                    "cosinaschema2"."Recipe" as recipe
                INNER JOIN 
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
                    orderedByIng.rc,
                    orderedByIng.N,
                    orderedByIng.A
                ORDER BY 
                    orderedByIng.rc ASC,
                    orderedByIng.N DESC,
                    orderedByIng.A DESC
            `

            if(Recipes.length === 0){
                throw new ClientError(`No recipes found`, 404);
            }


            return Recipes.map((Recipe) => 
                (
                    { 
                        ...Recipe
                    }
                )
            );


        } catch (error) {
            throw new AppError("Cannot retrieve recipes");
        }

    }


    static async SearchRecipesByQueryIng(Query, Ingredients, PageNumber, RowNumber) {

        try {

            const defaultIngredients = ['water', 'salt', 'pepper'];
            const FilteredIngredients = [...new Set(Ingredients)];
            const AllIngredients = [...new Set([...FilteredIngredients, ...defaultIngredients])];

            const Recipes = await prisma.$queryRaw`
                
                WITH RecipeCounts AS (

                    SELECT
                        IngRec.recipeid as id,
                        CAST(count(DISTINCT IngRec.ingid) AS FLOAT) as A,
                        CAST(count(DISTINCT tag.tag) AS FLOAT) as c_tag,


                        COUNT(CASE WHEN IngRec.ingid IN (${
                                    Prisma.join(
                                        FilteredIngredients.map((q) =>
                                            Prisma.sql`${q}`
                                        )
                                    )
                                }) THEN 1 END) AS N,


                        recipe.ing_nb as T,
                        recipe.tag_nb as tag_c

                    FROM "cosinaschema2"."IngredientsOnRecipes" as IngRec 

                    JOIN "cosinaschema2"."Recipe" as recipe
                    ON recipe.recipe_id = IngRec.recipeid
 

                    JOIN "cosinaschema2"."Tag" as tag
                    ON tag.refid = IngRec.recipeid

                   
                    WHERE IngRec.ingid IN (
                            ${
                                Prisma.join(
                                    AllIngredients.map((q) =>
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

                    GROUP BY id, T, tag_c 

                ), 

                OrderedRecipesByIng AS (
                    SELECT id, N, c_tag, A, tag_c, (T - A) AS rec
                    FROM RecipeCounts
                    ORDER BY rec ASC, N DESC, A DESC, c_tag DESC, tag_c
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
                    recipe.thumbnail_imageurl as recipe_imgurl,

                    recipe.calories as r_calories, 
                    recipe.total_fat as r_total_fat,
                    recipe.sat_fat as r_sat_fat,
                    recipe.protein as r_protein,
                    recipe.sodium as r_sodium,
                    recipe.potassium as r_potassium,
                    recipe.cholesterol as r_cholesterol,
                    recipe.carbohydrates as r_carbohydrates,
                    recipe.fiber as r_fiber,
                    recipe.sugar as r_sugar,

                    array_agg(presentedstring) presentedstring,
                    array_agg(unit) as unit,
                    array_agg(value) as value,
                    array_agg(valueingram) as valueingram,
                    array_agg(ingredient_name) as ingredient_name,
                    array_agg(ing.calories) as calories,
                    array_agg(ing.total_fat) as total_fat,
                    array_agg(ing.sat_fat) as sat_fat,
                    array_agg(ing.protein) as protein,
                    array_agg(ing.sodium) as sodium,
                    array_agg(ing.potassium) as potassium,
                    array_agg(ing.cholesterol) as cholestrol,
                    array_agg(ing.carbohydrates) as carbohydrates,
                    array_agg(ing.fiber) as fiber,
                    array_agg(ing.sugar) as sugar,
                    array_agg(category) category,
                    array_agg(ing.thumbnail_imageurl) as ingredient_imgurls,
                    recipe.votes as votes
            
                FROM 
                    "cosinaschema2"."Recipe" as recipe
                INNER JOIN 
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
                    orderedByIng.tag_c, 
                    orderedByIng.c_tag,
                    orderedByIng.rec,
                    orderedByIng.A,
                    orderedByIng.N
                ORDER BY 
                    orderedByIng.rec ASC,
                    orderedByIng.N DESC,
                    orderedByIng.A DESC,
                    orderedByIng.c_tag DESC,
                    orderedByIng.tag_c


            `


            if(Recipes.length === 0){
                throw new ClientError(`No recipes found`, 404);
            }

            return Recipes.map((Recipe) => 
                (
                    { 
                        ...Recipe
                    }
                )
            );

        } catch (error) {
            throw new AppError("Cannot retrieve recipes");
        }


    }



    static async SearchSuggestionsRecipe(Query, PageNumber, RowNumber) {
        try {

            const Suggestions = await prisma.$queryRaw`

                SELECT DISTINCT
                    title,
                    LENGTH(title)
                FROM 
                    "cosinaschema2"."Recipe"
                ${
                    Prisma.sql`WHERE
                        title LIKE ${Query + '%'}   
                    `
                }
                ORDER BY LENGTH(title) ASC
                ${
                    Prisma.sql`LIMIT ${RowNumber}`
                }
                ${
                    Prisma.sql`OFFSET ${(PageNumber - 1) * RowNumber}`
                }
            `


            if(Suggestions.length === 0){
                throw new ClientError(`No Suggestions found`, 404);
            }

            return Suggestions.map((sugg) => sugg.title);



        } catch (error) {
            throw new AppError("Cannot retrieve recipes");
        }

    }

    static async voteRecipe(userId, recipeId, vote) {
        try{

            const recipeExists = `DO $$ 
                DECLARE
                    recid TEXT := '${recipeId}';
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM "cosinaschema2"."Recipe" WHERE recid = recipe_id LIMIT 1) THEN
                        RAISE EXCEPTION 'Recipe ID % does not exist in the table', recid;
                    END IF;
                END $$;
            `;

            await prisma.$transaction([
                prisma.$executeRawUnsafe(recipeExists),
                prisma.$executeRaw`
                    DELETE FROM 
                        "cosinaschema2"."Vote" 
                    ${
                        Prisma.sql`WHERE recipeid = ${recipeId} AND userid = ${userId}`
                    }
                `,
                prisma.$executeRaw`
                    INSERT INTO "cosinaschema2"."Vote" (
                        userid,
                        recipeid,
                        vote_value
                    ) 
                    ${
                        Prisma.sql`VALUES (
                            ${userId},
                            ${recipeId},
                            ${vote}
                        )`
                    }

                `,
                prisma.$executeRaw`
                    WITH cte AS (
                        SELECT 
                            recipeid, 
                            SUM(v.vote_value) as sum_votes
                        FROM "cosinaschema2"."Vote" as v 
                        ${
                            Prisma.sql`
                                WHERE v.recipeid = ${recipeId}
                            `
                        }
                        GROUP BY v.recipeid
                    )
                    UPDATE "cosinaschema2"."Recipe" as recipe
                    SET votes = cte.sum_votes 
                    FROM cte
                    WHERE cte.recipeid = recipe.recipe_id
                `
            ])
        }
        catch(err){
            throw new AppError("Cannot delete the recipe");
        }

    }

}



module.exports = RecipeDataAccess;