const AppError = require('../Exceptions/AppError');
const ClientError = require('../Exceptions/ClientError');
const fs = require('fs');
const base64 = require('base64-js');
const backblaze = require('./../Config/backblaze');



class ImageDataAccess{
    static async initialize(){
        ImageDataAccess.b2 = await backblaze;
    }

    static async StoreImage(Id, EncodedImage, isRecipe = false, isThumbnail = false){
        try{

            const b2 = ImageDataAccess.b2;
            const folderName = ((isRecipe) ? b2.recipeFolder : b2.ingredientFolder) + ((isThumbnail) ? b2.thumbnailFolder: b2.mainFolder);
            
            if(typeof(isRecipe) !== typeof(true)){
                throw new Error();
            }

            const fileName = folderName + Id

            await b2.b2.uploadFile({
                uploadUrl: b2.uploadUrl,
                uploadAuthToken: b2.authToken,
                fileName: fileName,
                data: Buffer.from(EncodedImage, 'base64')
            });

            return b2.bucketUrl + fileName;

        }
        catch(e){
            throw new AppError(e.message, 500);
        }
    }


    static async DeleteImage(Id, isRecipe = false){
        try{

            const b2 = ImageDataAccess.b2;
            const folderName = (isRecipe) ? b2.recipeFolder : b2.ingredientFolder
            const fileName = folderName + Id;

            const fileList = await b2.b2.listFileNames({
                bucketId: b2.bucketId,
                startFileName: fileName,
                maxFileCount: 1 
            });
    
            if (fileList.data.files.length > 0) {
                const fileToDelete = fileList.data.files[0]; 
    
                await b2.b2.deleteFileVersion({
                    fileId: fileToDelete.fileId,
                    fileName: fileToDelete.fileName
                });
            }

            return;
        }
        catch(e){
            throw new AppError(e.message, 500);
        }
    }



/*
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
*/
}

ImageDataAccess.initialize();

module.exports = ImageDataAccess;