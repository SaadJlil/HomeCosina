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

            await [b2.thumbnailFolder, b2.mainFolder].forEach(async (subFolder) => {

                const fileName = folderName + subFolder + Id;

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

            });
 

            return;
        }
        catch(e){
            throw new AppError(e.message, 500);
        }
    }

}

ImageDataAccess.initialize();

module.exports = ImageDataAccess;