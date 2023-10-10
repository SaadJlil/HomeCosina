const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const ClientError = require('./../Exceptions/ClientError')
const AppError = require('./../Exceptions/AppError');
const UserDataAccess = require('./../DataAccess/UserDataAccess');
const successResponse = require('./../Contracts/successResponse');


class AuthController {
/*
    @TryCatchErrorsDecorator
    static async signup(req, res, next) {

        //basically firebase
        const userData = await AuthService.SignUpUserService(req.body.email, req.body.password);

        const userId = userData.user.uid
        const userEmail = req.body.email
        const username = req.body.username

        //Add use to the postgres database (no passowrd etc...) 
        await UserService.AddUserDatabase(username, userEmail, userId)

        const refreshToken = await TokenService.createRefreshToken(userId);
        const accessToken = await TokenService.createAccessToken(userId, refreshToken.id);

        const confirmationLink = emailConfig.emailConfirmationLink + await TokenService.createEmailToken(userId);
        EmailService.sendConfirmationEmail(userEmail, username, confirmationLink);

        res.json(new successResponse({accessToken, refreshToken}));
    }
*/
}




module.exports = AuthController;