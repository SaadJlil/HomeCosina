const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const firebase = require("../Config/firebaseClient")
const AppError = require("./../Exceptions/AppError")
const ClientError = require("./../Exceptions/ClientError")
const admin = require('./../Config/firebaseServer')


class AuthService {
    static async SignUpUserService(email, password){
        const data = await firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .catch(function (error) {
                throw new AppError(error.message, error.code);
            });   

        return data;
    }

    static async DeleteUserAccount(uuid){
        await admin
            .auth()
            .deleteUser(uuid)
            .catch((error) => {
                throw new AppError(error.message, error.code);
            });
    }

    static async SignInUserService(email, password){
        try{
            const user = await firebase
                .auth()
                .signInWithEmailAndPassword(email, password)
                .catch(function (error) {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    throw new AppError(errorMessage, errorCode);
                });
            return user;
        } catch(error){
            throw new ClientError("Problem with Email or Password", 400);
        }
    }
}

module.exports = AuthService;
