const ErrorCatcher = require('./../Decorators/TryCatchErrorsDecorator');
const request = require('request')

const ClientError = require('../Exceptions/ClientError');
const { recipe } = require('../Config/Prisma');




class ValidationMiddleware{

/*
    @TryCatchErrorsDecorator
    static async ValidateSignUp(req, res, next){

        if (!req.body.emasl) {
            throw new ClientError("Email is required", 400);
        }

        if (!req.body.password) {
            throw new ClientError("Password is required", 400);
        }  
        
        if (!req.body.username) {
            throw new ClientError("Username is required", 400);
        }  

        await emailValidator.signUp(req.body.email);

        await passwordValid(req.body.password);

        await usernameValidator(req.body.username)

        return next();

    }
*/

    @ErrorCatcher.TryCatchErrorsDecorator
    static GetRecipeByIdValidationMiddleware(id){
        try {

            if(id.length > 36){
                throw new ClientError("Wrong Recipe Id", 400);
            }


        }
        catch(err){
            throw err
        }

    }

    @ErrorCatcher.TryCatchErrorsDecorator
    static CreateRecipeValidationMiddleware(recipeData){
        try {

            //steps
            if(recipeData.steps.length > 20){
                throw new ClientError('Recipe has too many steps', 400);
            }

            recipeData.steps.forEach((step)=>{
                if(step.length > 1000){
                    throw new ClientError('Each step must have less than 1000 characters', 400);
                }
            });


            //title
            if(recipeData.title.length > 250){
                throw new ClientError('title must have less than 250 characters', 400);
            }


            //link

            const linkValidationRegEx = new RegExp(
                '^([a-zA-Z]+:\\/\\/)?' + // protocol
                  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
                  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                  '(\\#[-a-z\\d_]*)?$', // fragment locator
                'i'
              );

            if(recipeData.link.length > 3){
                throw new ClientError('Recipe has too many links', 400);
            }

            recipeData.link.forEach((l) => {
                    if(l.length > 250 || (!linkValidationRegEx.test(l))){
                        throw new ClientError('invalid link', 400);
                    }
                }
            )


            //cookingtime_min
            if(recipeData.cookingtime_min < 0 || recipeData.cookingtime_min > 600){
                throw new ClientError('Invalid cooking time (must be between 0 and 10 hours', 400);
            }

            //recipe_imageurl
            if(recipeData.recipe_imageurl > 250){
                throw new ClientError('Invalid image url', 400);
            }

            //ingredients_id
            if(recipeData.ingredients_id.length > 40){
                throw new ClientError('Too many ingredients', 400);
            }

            recipeData.ingredients_id.forEach((id)=>{
                if(id.length > 250){
                    throw new ClientError('invalid ingredients', 400);
                }
            });

            //Ingredients, units, values and valuesingram must have the same size
            if( recipeData.ingredients_id.length !== recipeData.units.length ||
                recipeData.ingredients_id.length !== recipeData.values.length ||
                recipeData.ingredients_id.length !== recipeData.valuesingram.length
            ){
                throw new ClientError('Recipe measurements are faulty', 400);
            }


            //units
            /*
                Units should be controlled by creating an array of valid units
                and comparing each unit with that array
            */


            //values
            recipeData.values.forEach((value) => {
                if(value < 0 || value > 10000){
                    throw new ClientError('Wrong measurement value', 400);
                }
            })

            //valuesingram
            recipeData.valuesingram.forEach((value) => {
                if(value < 0 || value > 100000){
                    throw new ClientError('Wrong measurement (in gram) value', 400);
                }
            })


            //tags
            if(recipeData.tags.length > 20){
                throw new ClientError('A recipe cannot have more than 20 tags', 400);
            }

            const tagRegEx = /^[A-Za-z]+$/
            recipeData.tags.forEach((tag)=>{
                if(tag.length > 250 || !(tagRegEx.test(tag))){
                    throw new ClientError('invalid tags', 400);
                }
            });
        }
        catch(err){
            throw err
        }

    }

    @ErrorCatcher.TryCatchErrorsDecorator
    static DeleteRecipeValidationMiddleware(recipe_id){
        try{

            const recipeIdRegEx = /^[A-Za-z0-9-]+$/

            if(recipe_id.length > 250 || !(recipeIdRegEx.test(recipe_id))){
                throw new ClientError('invalid recipe', 400);
            }           
        }
        catch(err){
            throw err;
        }
    }

    @ErrorCatcher.TryCatchErrorsDecorator
    static EditRecipeValidationMiddleware(recipeData){
        try {

            //recipeId
            if(recipeData.recipe_id.length > 250){
                throw new ClientError('invalid recipeid', 400);
            }

            //steps
            if(recipeData.steps.length > 20){
                throw new ClientError('Recipe has too many steps', 400);
            }

            recipeData.steps.forEach((step)=>{
                if(step.length > 1000){
                    throw new ClientError('Each step must have less than 1000 characters', 400);
                }
            });


            //title
            if(recipeData.title.length > 250){
                throw new ClientError('title must have less than 250 characters', 400);
            }


            //link

            const linkValidationRegEx = new RegExp(
                '^([a-zA-Z]+:\\/\\/)?' + // protocol
                  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
                  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
                  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                  '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                  '(\\#[-a-z\\d_]*)?$', // fragment locator
                'i'
              );

            if(recipeData.link.length > 3){
                throw new ClientError('Recipe has too many links', 400);
            }

            recipeData.link.forEach((l) => {
                    if(l.length > 250 || (!linkValidationRegEx.test(l))){
                        throw new ClientError('invalid link', 400);
                    }
                }
            )


            //cookingtime_min
            if(recipeData.cookingtime_min < 0 || recipeData.cookingtime_min > 600){
                throw new ClientError('Invalid cooking time (must be between 0 and 10 hours', 400);
            }

            //recipe_imageurl
            if(recipeData.recipe_imageurl > 250){
                throw new ClientError('Invalid image url', 400);
            }

            //ingredients_id
            if(recipeData.ingredients_id.length > 40){
                throw new ClientError('Too many ingredients', 400);
            }

            recipeData.ingredients_id.forEach((id)=>{
                if(id.length > 250){
                    throw new ClientError('invalid ingredients', 400);
                }
            });

            //Ingredients, units, values and valuesingram must have the same size
            if( recipeData.ingredients_id.length !== recipeData.units.length ||
                recipeData.ingredients_id.length !== recipeData.values.length ||
                recipeData.ingredients_id.length !== recipeData.valuesingram.length
            ){
                throw new ClientError('Recipe measurements are faulty', 400);
            }


            //units
            /*
                Units should be controlled by creating an array of valid units
                and comparing each unit with that array
            */


            //values
            recipeData.values.forEach((value) => {
                if(value < 0 || value > 10000){
                    throw new ClientError('Wrong measurement value', 400);
                }
            })

            //valuesingram
            recipeData.valuesingram.forEach((value) => {
                if(value < 0 || value > 100000){
                    throw new ClientError('Wrong measurement (in gram) value', 400);
                }
            })


            //tags
            if(recipeData.tags.length > 20){
                throw new ClientError('A recipe cannot have more than 20 tags', 400);
            }

            const tagRegEx = /^[A-Za-z]+$/
            recipeData.tags.forEach((tag)=>{
                if(tag.length > 250 || !(tagRegEx.test(tag))){
                    throw new ClientError('invalid tags', 400);
                }
            });
        }
        catch(err){
            throw err
        }

    }

}




module.exports = ValidationMiddleware;