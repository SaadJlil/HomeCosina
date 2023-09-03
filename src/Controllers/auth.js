const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const ClientError = require('./../Exceptions/ClientError')
const firebase = require("./../Config/firebase")
const AuthService = require('./../Services/Auth')
const UserService = require('./../Services/User')



class AuthController {

    @TryCatchErrorsDecorator
    static async signup(req, res, next) {

        //basically firebase
        AuthService.SignUpUserService(req.body.email, req.body.password, next);


        //Add use to the postgres database (no passowrd etc...) 
        UserService.AddUserDatabase(req.body.username, req.body.email, next)

        res.json('success');
    }




    @TryCatchErrorsDecorator
    static async signin(req, res, next) {

        firebase
            .auth()
            .signInWithEmailAndPassword(req.body.email, req.body.password)
            .then((user) => {
                return res.status(200).json(user);
            })
            .catch(function (error) {
                let errorCode = error.code;
                let errorMessage = error.message;
                throw new ClientError(errorMessage, errorCode);
           });

    }
}




module.exports = AuthController;