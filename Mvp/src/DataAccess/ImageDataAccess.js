const AppError = require('../Exceptions/AppError');
const ClientError = require('../Exceptions/ClientError');
const fs = require('fs');
const base64 = require('base64-js');






class ImageDataAccess{
    static StoreImage(Id, EncodedImage, isRecipe = false){
            try{
                if(typeof(isRecipe) !== typeof(true)){
                    throw new Error();
                }

                try{
                    ImageDataAccess.DeleteImage(Id, isRecipe);
                }
                catch(err){}

                // Decode the base64 string to binary data
                const BinaryImage = base64.toByteArray(EncodedImage);

                // Specify the file path where you want to save the image
                const filePath = `./Images/${(isRecipe) ? 'Recipes' : 'Ingredients'}/${Id}.png`;

                // Write the binary data to a file
                fs.writeFileSync(filePath, BinaryImage);

            }
            catch(e){
                throw new AppError(e.message, 500);
            }

    }


    static DeleteImage(Id, isRecipe = false){
        try{

            const filePath = `./Images/${(isRecipe) ? 'Recipes' : 'Ingredients'}/${Id}.png`;

            fs.rmSync(filePath, {
                force: true,
            });

        }
        catch(e){
            throw new AppError(e.message, 500);
        }

    }

    static GetImage(Id, isRecipe = false){
        try{

            const filePath = `./Images/${(isRecipe) ? 'Recipes' : 'Ingredients'}/${Id}.png`;

            const imageData = fs.readFileSync(filePath);

            // Encode the image data as Base64
            const base64String = imageData.toString('base64');
        
            return base64String;

        }
        catch(e){
            return "";
        }

    }
}


module.exports = ImageDataAccess;