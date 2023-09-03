const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const firebase = require("./../Config/firebase")
const AppError = require("./../Exceptions/AppError")


class AuthService {
    @TryCatchErrorsDecorator
    static async SignUpUserService(email, password, next){
        throw new AppError("thing", 500);
        firebase
                .auth()
                .createUserWithEmailAndPassword(email, password)
                .then((data) => {
                    //return res.status(201).json(data);
                })
                .catch(function (error) {
                    let errorCode = error.code;
                    let errorMessage = error.message;
                    console.log(errorMessage);
                    //throw new AppError(error.message, error.code);
                });   
    }

}

module.exports = AuthService;
