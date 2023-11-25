
const B2 = require('backblaze-b2');
const dotenv = require('dotenv');
const path = require('path');
const AppError = require('../Exceptions/AppError');

const root = path.join.bind(this, __dirname, "../../");
dotenv.config({ path: root(".env") });

let b2Data = null;

const initializeB2 = async () => {
    try {
        if (b2Data) {
            // If B2 client is already initialized, return the existing data
            return b2Data;
        }

        if (!process.env.HOST || !process.env.PORT) {
            throw new Error("Can't find .env config variables for work app");
        }

        const isDev = process.env.NODE_ENV === "development";
        const isProd = !isDev;

        const b2 = new B2({
            applicationKeyId: process.env.APPLICATIONKEY_ID,
            applicationKey: process.env.APPLICATIONKEY
        });

        await b2.authorize();

        const bucketId = process.env.BUCKET_ID;
        const userFolder = process.env.USERFOLDER;
        const recipeFolder = process.env.RECIPEFOLDER;
        const ingredientFolder = process.env.INGREDIENTFOLDER;
        const bucketUrl = process.env.BUCKET_URL;
        const thumbnailFolder = process.env.THUMBNAILFOLDER;
        const mainFolder = process.env.THUMBNAILFOLDER = "m/";

        const upld_object = await b2.getUploadUrl({ bucketId });

        b2Data = {
            b2: b2,
            uploadUrl: upld_object.data.uploadUrl,
            bucketId: bucketId,
            authToken: upld_object.data.authorizationToken,
            recipeFolder: recipeFolder,
            userFolder: userFolder,
            ingredientFolder: ingredientFolder,
            bucketUrl: bucketUrl ,
            thumbnailFolder: thumbnailFolder,
            mainFolder: mainFolder 
        };

        return b2Data;
    } catch (err) {
        throw new AppError('Problem with B2 authorization or getuploadurl', 500);
    }
};

module.exports = initializeB2();