const TryCatchErrorsDecorator = require('./../Decorators/TryCatchErrorsDecorator');
const ClientError = require('./../Exceptions/ClientError')
const firebase = require("../Config/firebaseClient")
const AuthService = require('./../Services/Auth')
const TokenService = require('./../Services/TokenService')
const emailConfig = require("../Config/email");
const EmailService = require('./../Services/EmailService')
const UserService = require('./../Services/User')
const admin = require('./../Config/firebaseServer');
const AppError = require('./../Exceptions/AppError');
const UserDataAccess = require('./../DataAccess/UserDataAccess');
const successResponse = require('./../Contracts/successResponse');
const { verify } = require('jsonwebtoken');
const sharp = require('sharp');
const imageConfig = require('./../Config/image');
const ImageDataAccess = require('./../DataAccess/ImageDataAccess');


class AuthController {

    @TryCatchErrorsDecorator
    static async signup(req, res, next) {
        var userData, userId;

        try{
          //basically firebase
          userData = await AuthService.SignUpUserService(req.body.email, req.body.password);
          userId = userData.user.uid;

        }catch(error){
          throw new AppError("We're currently experiencing server issues while processing account sign-ups. Please attempt again in a few minutes.", 500);
        }

        if(!!req.body.profilepic){
          try{

            const profilePic = req.body.profilepic;

            const base64Image = profilePic.split(',')[1]; 

            const buffer = Buffer.from(base64Image, 'base64');
            
            const thumbnailImage_ = await sharp(buffer)
                .resize({ width: imageConfig.thumbnailWidth, height: imageConfig.thumbnailWidth})
                .toBuffer();
            
            
            
            const thumbnailImage = thumbnailImage_.toString('base64');

            const mainImage_ = await sharp(buffer)
                .resize({ width: imageConfig.mainWidth, height: imageConfig.mainlWidth})
                .toBuffer();
            
            const mainImage = mainImage_.toString('base64');


            var mainImageUrl = '';
            var thumbnailImageUrl = '';

            mainImageUrl = await ImageDataAccess.StoreImage(userId, mainImage, false);
            thumbnailImageUrl = await ImageDataAccess.StoreImage(userId, thumbnailImage, true);
            
          }catch(err){
              throw AppError("Cannot upload image", 500);
          }
        }


        const userEmail = req.body.email
        const username = req.body.username
        const bio = req.body.bio

        //Add use to the postgres database (no passowrd etc...) 
        await UserService.AddUserDatabase(username, userEmail, userId, bio, mainImageUrl, thumbnailImageUrl)

        const refreshToken = await TokenService.createRefreshToken(userId);
        const accessToken = await TokenService.createAccessToken(userId, refreshToken.id);

        const confirmationLink = emailConfig.emailConfirmationLink + await TokenService.createEmailToken(userId);
        EmailService.sendConfirmationEmail(userEmail, username, confirmationLink);
        res.json(new successResponse({accessToken, refreshToken, userId}));
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
        const userId = user.user.uid;


        const refreshToken = await TokenService.createRefreshToken(userId);
        const accessToken = await TokenService.createAccessToken(userId, refreshToken.split("::")[0]);

        res.json(new successResponse({ accessToken, refreshToken, userId}));

    }

    @TryCatchErrorsDecorator
    static async logout(req, res, next) {

        await TokenService.removeRefreshTokenUser(req.userId, req.refreshTokenId);

        res.json(new successResponse("You have been successfully logged out."));
    }


    @TryCatchErrorsDecorator
    static async emailConfirmation(req, res, next) {
      const data = await TokenService.verifyEmailToken(req.params.token);
      const userId = data.id;

      await UserDataAccess.confirmEmailById(userId);

      res.json(new successResponse("Your email has been confirmed!"));
      
    }


}




module.exports = AuthController;