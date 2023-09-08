const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const ClientError = require('./../Exceptions/ClientError')
const firebase = require("../Config/firebaseClient")
const AuthService = require('./../Services/Auth')
const UserService = require('./../Services/User')
const admin = require('./../Config/firebaseServer');
const AppError = require('./../Exceptions/AppError');



class AuthController {

    @TryCatchErrorsDecorator
    static async signup(req, res, next) {

        //basically firebase
        const user = await AuthService.SignUpUserService(req.body.email, req.body.password);

        //Add use to the postgres database (no passowrd etc...) 
        await UserService.AddUserDatabase(req.body.username, req.body.email, userData.user.uid)

        const uid = user.user.uid;

        res.json(AuthService.CreateToken(uid));

    }

    @TryCatchErrorsDecorator
    static async signin(req, res, next) {

        const user = await AuthService.SignInUserService(req.body.email, req.body.password);
        const uid = user.user.uid;


        res.json(AuthService.CreateToken(uid));

    }
}




module.exports = AuthController;