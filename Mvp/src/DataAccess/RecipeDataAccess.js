const AppError = require('./../Exceptions/AppError');
const ClientError = require('./../Exceptions/ClientError');
const prisma = require('./../Config/Prisma');
const { Prisma } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const ImageDataAccess = require('./../DataAccess/ImageDataAccess');



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
                    recipe.imageurl as recipe_imgurl,
                    array_agg(presentedstring) as presentedstring,
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

            const thing = prisma.$executeRaw`
                    UPDATE "cosinaschema2"."Recipe" as recipe
                    SET views = recipe.views + 1
                    FROM "cosinaschema2"."Recipe" as src_recipe
                    ${
                        Prisma.sql`WHERE recipe.recipe_id = ${id}`
                    }
                `


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
                ...Recipe[0], 
                image: ImageDataAccess.GetImage(id, true)
            };

        } catch (error) {
            //console.log(error);
            throw new AppError("Cannot retrieve the recipe");
        }

    }

    static async createRecipe(recipeData, userId) {
        try {

            const recipe_id = uuidv4();

            if(!!recipeData.image){
                try{
                    ImageDataAccess.StoreImage(recipe_id, recipeData.image.split(',')[1], true);
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
                        presentedstring: '',
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
                                    Prisma.sql`${recipeData.title.toLowerCase()}`,
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

            } catch(err) {
                ImageDataAccess.DeleteImage(recipeData.recipe_id, true);
                throw err;
            }
            

        } catch (error) {
            console.log(error)
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


            await RecipeDataAccess.deleteRecipeById(recipeData.recipe_id, userId, false);

            if(!!recipeData.image){
                try{
                    ImageDataAccess.StoreImage(recipeData.recipe_id, recipeData.image.split(',')[1], true);
                }catch(err){
                    throw AppError("Cannot upload update recipe image", 500);
                }
            }



            const recipe_id = recipeData.recipe_id;
            
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
                            votes,
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
                                Prisma.sql`${preservedData.date}`,
                                Prisma.sql`${preservedData.views}`,
                                Prisma.sql`${preservedData.votes}`,
                                Prisma.sql`${all_tags.length}`,
                                Prisma.sql`${measurements.length}`
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
            console.log(error)
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
                    array_agg(ing.imageurl) as ingredient_imgurls,

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
                        ...Recipe, 
                        image: ImageDataAccess.GetImage(Recipe.recipe_id, true)
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
                        ...Recipe, 
                        image: ImageDataAccess.GetImage(Recipe.recipe_id, true)
                    }
                )
            );

        } catch (error) {
            console.log(error);
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
                        ...Recipe, 
                        image: ImageDataAccess.GetImage(Recipe.recipe_id, true)
                    }
                )
            );


        } catch (error) {
            console.log(error);
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
                        ...Recipe, 
                        image: ImageDataAccess.GetImage(Recipe.recipe_id, true)
                    }
                )
            );

        } catch (error) {
            console.log(error);
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
            console.log(error);
            throw new AppError("Cannot retrieve recipes");
        }

    }

    static async voteRecipe(userId, recipeId, vote) {
        try{
            console.log(userId);

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
            console.log(err)
            throw new AppError("Cannot delete the recipe");
        }

    }





}



module.exports = RecipeDataAccess;