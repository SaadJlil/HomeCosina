const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const ClientError = require('./../Exceptions/ClientError')
const firebase = require("../Config/firebaseClient")
const AuthService = require('./../Services/Auth')
const TokenService = require('./../Services/TokenService')
const UserService = require('./../Services/User')
const admin = require('./../Config/firebaseServer');
const AppError = require('./../Exceptions/AppError');



class AuthController {

    @TryCatchErrorsDecorator
    static async signup(req, res, next) {

        //basically firebase
        const userData = await AuthService.SignUpUserService(req.body.email, req.body.password);

        const uid = userData.user.uid

        //Add use to the postgres database (no passowrd etc...) 
        await UserService.AddUserDatabase(req.body.username, req.body.email, uid)

        const AccessToken = await AuthService.CreateToken(uid);

        res.json(AccessToken);

    }

    @TryCatchErrorsDecorator
    static async signin(req, res, next) {

        const user = await AuthService.SignInUserService(req.body.email, req.body.password);
        const uid = user.user.uid;


        const refreshToken = await TokenService.createRefreshToken(uid);


        //const token = await AuthService.CreateToken(uid);
        const accessToken = await TokenService.createAccessToken(uid, refreshToken.id);

        res.json({accessToken, refreshToken: refreshToken.token});
    }

    @TryCatchErrorsDecorator
    static async logout(req, res, next) {

        await TokenService.removeRefreshTokenUser(req.userId, req.refreshTokenId);

        res.json("You have been successfully logged out.");
    }

}




module.exports = AuthController;