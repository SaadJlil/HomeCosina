const ClientError = require('./../Exceptions/ClientError');
const base64 = require('base64-js');
const sizeOf = require('image-size');




function picValid(EncodedImage){
    try{
        const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,([A-Za-z0-9+/]+={0,2})$/;
        if(!base64Regex.test(EncodedImage)){
            throw new Error();
        }

        const dimensions = sizeOf(Buffer.from(EncodedImage.split(',')[1], 'base64'));

        if(dimensions.width > 2000 || dimensions.height > 2000){
            throw new Error();
        }

    }catch(err){
        throw new ClientError('Picture is not valid', 400)
    }
}



module.exports = picValid;