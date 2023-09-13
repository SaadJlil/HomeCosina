const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const ClientError = require('./../Exceptions/ClientError')
const firebase = require("../Config/firebaseClient")
const AuthService = require('./../Services/Auth')
const TokenService = require('./../Services/TokenService')
const UserService = require('./../Services/User')
const admin = require('./../Config/firebaseServer');
const AppError = require('./../Exceptions/AppError');
const UserDataAccess = require('./../DataAccess/UserDataAccess');
const successResponse = require('./../Contracts/successResponse');
const { verify } = require('jsonwebtoken');



class AuthController {

    @TryCatchErrorsDecorator
    static async signup(req, res, next) {

        //basically firebase
        const userData = await AuthService.SignUpUserService(req.body.email, req.body.password);

        const userId = userData.user.uid

        //Add use to the postgres database (no passowrd etc...) 
        await UserService.AddUserDatabase(req.body.username, req.body.email, userId)

        const refreshToken = await TokenService.createRefreshToken(userId);
        const accessToken = await TokenService.createAccessToken(userId, refreshToken.id);

        const link = "http://localhost:3000/api/email-confirmation=" + await TokenService.createEmailToken(userId);


        res.json(new successResponse({accessToken, refreshToken, link}));
    }


    @TryCatchErrorsDecorator
    static async refreshTokens(req, res) {
      const refreshTokenRequest = req.body.refreshToken;
  
      const verifyData = await TokenService.verifyRefreshToken(
        refreshTokenRequest
      );

      const user = await UserDataAccess.GetUserById(verifyData.id);
      const userId = user.id;
  
      await TokenService.checkRefreshTokenUser(
        userId,
        refreshTokenRequest
      );
  
      const refreshId = refreshTokenRequest.split("::")[0];

      await TokenService.removeRefreshTokenUser(userId, refreshId);


      const refreshToken = await TokenService.createRefreshToken(userId);
      const accessToken = await TokenService.createAccessToken(userId, refreshToken.id);
  
      res.json(new successResponse({ accessToken, refreshToken }));
    }
  


    @TryCatchErrorsDecorator
    static async signin(req, res, next) {

        const user = await AuthService.SignInUserService(req.body.email, req.body.password);
        const uid = user.user.uid;


        const refreshToken = await TokenService.createRefreshToken(uid);
        const accessToken = await TokenService.createAccessToken(uid, refreshToken.split("::")[0]);

        res.json(new successResponse({ accessToken, refreshToken }));
    }

    @TryCatchErrorsDecorator
    static async logout(req, res, next) {

        await TokenService.removeRefreshTokenUser(req.userId, req.refreshTokenId);

        res.json(new successResponse("You have been successfully logged out."));
    }


    @TryCatchErrorsDecorator
    static async emailConfirmation(req, res, next) {
      res.json(await TokenService.verifyEmailToken(req.params.token));
    }


}




module.exports = AuthController;