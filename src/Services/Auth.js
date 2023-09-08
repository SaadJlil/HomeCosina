const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const firebase = require("../Config/firebaseClient")
const AppError = require("./../Exceptions/AppError")
const ClientError = require("./../Exceptions/ClientError")
const admin = require('./../Config/firebaseServer');
const { user } = require('../Config/Prisma');


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

    static async verifyAccessToken(token){
        const userCred = await firebase 
            .auth()
            .signInWithCustomToken(token)
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                throw new ClientError(errorMessage, errorCode);
            });
        
        return { id: userCred.user.uid };
    }

    static async CreateJwtToken(uid){
        try {
            const payload = {
                id: user._id
            };

            const options = {
                algorithm: "HS512",
                subject: user._id.toString(),
                expiresIn: config.expireAccess
            };

            const token = await sign(payload, config.secretAccess, options);

            return token;
        } catch (err) {
            throw new AppError(err.message);
        }
   }


    static async CreateToken(uid){
        const token = await admin
            .auth()
            .createCustomToken(uid)
            .catch((error) => {
                throw new AppError('Error creating custom token', 500);
            });

        return token;
    }
}

module.exports = AuthService;
