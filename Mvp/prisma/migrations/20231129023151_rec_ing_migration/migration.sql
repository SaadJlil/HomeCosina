-- CreateTable
CREATE TABLE "Recipe" (
    "recipe_id" TEXT NOT NULL,
    "steps" TEXT[],
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT[],
    "cookingtime_min" INTEGER NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "main_imageurl" TEXT,
    "thumbnail_imageurl" TEXT,
    "calories" DOUBLE PRECISION,
    "total_fat" DOUBLE PRECISION,
    "sat_fat" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "cholesterol" DOUBLE PRECISION,
    "carbohydrates" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "tag_nb" INTEGER NOT NULL,
    "ing_nb" INTEGER NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("recipe_id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "ingredient_name" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "total_fat" DOUBLE PRECISION NOT NULL,
    "sat_fat" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "sodium" DOUBLE PRECISION NOT NULL,
    "potassium" DOUBLE PRECISION NOT NULL,
    "cholesterol" DOUBLE PRECISION NOT NULL,
    "carbohydrates" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "sugar" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "main_imageurl" TEXT,
    "thumbnail_imageurl" TEXT,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("ingredient_name")
);

-- CreateTable
CREATE TABLE "IngredientsOnRecipes" (
    "recipeid" TEXT NOT NULL,
    "ingid" TEXT NOT NULL,
    "presentedstring" TEXT,
    "unit" TEXT,
    "value" DOUBLE PRECISION,
    "valueingram" DOUBLE PRECISION,

    CONSTRAINT "IngredientsOnRecipes_pkey" PRIMARY KEY ("recipeid","ingid")
);

-- CreateTable
CREATE TABLE "Tag" (
    "tag_id" TEXT NOT NULL,
    "type" VARCHAR(1) NOT NULL,
    "refid" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("tag_id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "userid" TEXT NOT NULL,
    "recipeid" TEXT NOT NULL,
    "vote_value" INTEGER NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userid","recipeid")
);

-- AddForeignKey
ALTER TABLE "IngredientsOnRecipes" ADD CONSTRAINT "IngredientsOnRecipes_recipeid_fkey" FOREIGN KEY ("recipeid") REFERENCES "Recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientsOnRecipes" ADD CONSTRAINT "IngredientsOnRecipes_ingid_fkey" FOREIGN KEY ("ingid") REFERENCES "Ingredient"("ingredient_name") ON DELETE RESTRICT ON UPDATE CASCADE;
