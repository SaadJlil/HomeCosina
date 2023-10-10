const ClientError = require('./../Exceptions/ClientError');
const UserDataAccess = require("./../DataAccess/UserDataAccess");



async function usernameValidator(username){

    if(username.length > 56 || username.length < 8){
        throw new ClientError("Username should be between 8 and 128 characters", 400);
    }

    const UsernameExists = await UserDataAccess.UsernameExists(username);
    if(UsernameExists){
        throw new ClientError("The username used is already taken", 409);
    }

}



module.exports = usernameValidator;