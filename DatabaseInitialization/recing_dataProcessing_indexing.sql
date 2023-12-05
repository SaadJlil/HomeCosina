-- CALCULATE RECIPE NUTRITION

UPDATE "cosinaschema2"."Recipe" AS recipe
SET calories = (
    SELECT
        SUM(ingrec.valueingram * ing.calories) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
total_fat = (
    SELECT
        SUM(ingrec.valueingram * ing.total_fat) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
sat_fat = (
    SELECT
        SUM(ingrec.valueingram * ing.sat_fat) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
protein = (
    SELECT
        SUM(ingrec.valueingram * ing.protein) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
sodium = (
    SELECT
        SUM(ingrec.valueingram * ing.sodium) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
potassium = (
    SELECT
        SUM(ingrec.valueingram * ing.potassium) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
cholesterol = (
    SELECT
        SUM(ingrec.valueingram * ing.cholesterol) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
carbohydrates = (
    SELECT
        SUM(ingrec.valueingram * ing.carbohydrates) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
fiber = (
    SELECT
        SUM(ingrec.valueingram * ing.fiber) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
),
sugar = (
    SELECT
        SUM(ingrec.valueingram * ing.sugar) / SUM(ingrec.valueingram)
    FROM
        "cosinaschema2"."IngredientsOnRecipes" AS ingrec
    INNER JOIN
        "cosinaschema2"."Ingredient" AS ing ON ing.ingredient_name = ingrec.ingid
    WHERE
        ingrec.recipeid = recipe.recipe_id
)
WHERE
    EXISTS (
        SELECT 1
        FROM "cosinaschema2"."IngredientsOnRecipes" AS ingrec
        WHERE ingrec.recipeid = recipe.recipe_id
    );





-- DELETE OVERFLOWING TAGS

DELETE FROM "cosinaschema2"."Tag" as t
WHERE NOT EXISTS (
    SELECT 1 FROM "cosinaschema2"."Ingredient" as ing WHERE ing.ingredient_name = t.refid
) AND NOT EXISTS (
    SELECT 1 FROM "cosinaschema2"."Recipe" as recipe WHERE recipe.recipe_id = t.refid
);




--DROP INDEXES

--Recipe Indexes
DROP INDEX "cosinaschema2"."index_recipe_recipe_id";
DROP INDEX "cosinaschema2"."index_recipe_userid";

--Ingredient Indexes
DROP INDEX "cosinaschema2"."index_ingredient_ingredient_name";

--IngredientsOnRecipes Indexes
DROP INDEX "cosinaschema2"."index_ingredientsonrecipes_ingid";
DROP INDEX "cosinaschema2"."index_ingredientsonrecipes_recipeid";

--Tag Indexes
DROP INDEX "cosinaschema2"."index_tag_type";
DROP INDEX "cosinaschema2"."index_tag_refid";
DROP INDEX "cosinaschema2"."index_tag_tag";


---new


DROP INDEX "cosinaschema2"."IX_Type_Tag_Unique";

------------------------------------

--DELETE SEARCH INGREDIENT


DROP INDEX "cosinaschema2"."ts_idx";

ALTER TABLE "cosinaschema2"."Tag" DROP COLUMN ts;


------------------------------------



--CREATING INDEXES

--Recipe Indexes
CREATE INDEX index_recipe_recipe_id on "cosinaschema2"."Recipe" (recipe_id);
CREATE INDEX index_recipe_userid on "cosinaschema2"."Recipe" (userid);


--Ingredient Indexes
CREATE INDEX index_ingredient_ingredient_name on "cosinaschema2"."Ingredient" (ingredient_name);



--IngredientsOnRecipes Indexes
CREATE INDEX index_ingredientsonrecipes_ingid on "cosinaschema2"."IngredientsOnRecipes" (ingid);
CREATE INDEX index_ingredientsonrecipes_recipeid on "cosinaschema2"."IngredientsOnRecipes" (recipeid);


--Tag Indexes
CREATE INDEX index_tag_type on "cosinaschema2"."Tag" (type);
CREATE INDEX index_tag_refid on "cosinaschema2"."Tag" (refid);
CREATE INDEX index_tag_tag on "cosinaschema2"."Tag" (tag);



--------------------------------------



DROP EXTENSION fuzzystrmatch;
CREATE EXTENSION fuzzystrmatch SCHEMA "cosinaschema2";


CREATE EXTENSION pg_trgm;




--new

--CREATE INDEX IX_Type_Tag_Unique ON "cosinaschema2"."Tag" (type, tag);


--CREATING SEARCH INGREDIENT

ALTER TABLE "cosinaschema2"."Tag" ADD COLUMN ts tsvector
    GENERATED ALWAYS AS (to_tsvector('english', refid)) STORED;


CREATE INDEX ts_idx ON "cosinaschema2"."Tag" USING GIN (ts);

