const TryCatchErrorsDecorator = require('../Decorators/TryCatchErrorsDecorator');
const ClientError = require('../Exceptions/ClientError')
const firebase = require("../Config/firebaseClient")
const AuthService = require('../Services/Auth')
const TokenService = require('../Services/TokenService')
const emailConfig = require("../Config/email");
const EmailService = require('../Services/EmailService')
const UserService = require('../Services/User')
const admin = require('../Config/firebaseServer');
const AppError = require('../Exceptions/AppError');
const UserDataAccess = require('../DataAccess/UserDataAccess');
const successResponse = require('../Contracts/successResponse');
const { verify } = require('jsonwebtoken');
const prisma = require('./../Config/Prisma')
const sharp = require('sharp');
const imageConfig = require('./../Config/image');
const ImageDataAccess = require('./../DataAccess/ImageDataAccess');




class UserController {

    @TryCatchErrorsDecorator
    static async getUserInfo(req, res, next) {
      const userData = await UserDataAccess.GetUserById(req.body.userId);

      const userInfo = {
          userId: userData.id,
          username: userData.username,
          bio: userData.bio,
          mainImage: userData.main_imageurl,
          thumbnailImage: userData.thumbnail_imageurl
      }

      res.json(new successResponse(
        userInfo
      ));
      
    }

    @TryCatchErrorsDecorator
    static async editUserInfo(req, res, next) {
      try{
        var mainImageUrl = '';
        var thumbnailImageUrl = '';

        if(!!req.body.profilepic){


          const userId = req.userId;

          try{
            await ImageDataAccess.DeleteImage(userId);
          }
          catch(err){}


          const profilePic = req.body.profilepic

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



          mainImageUrl = await ImageDataAccess.StoreImage(userId, mainImage, false);
          thumbnailImageUrl = await ImageDataAccess.StoreImage(userId, thumbnailImage, true);

        }

        const userData = await UserDataAccess.GetUserById(req.userId);
        const emailToChange = !!req.body.email && !(await UserDataAccess.UserEmailExists(req.body.email));
        const usernameToChange = !!req.body.username &&  !(await UserDataAccess.UsernameExists(req.body.username));


        await prisma.user.update({
          where: { id: req.userId},
          data: {
              email: (emailToChange) ? req.body.email : userData.email,
              emailconfirmed: (emailToChange) ? false: userData.emailconfirmed,
              username: (usernameToChange) ? req.body.username: userData.username,
              bio: !!req.body.bio ? req.body.bio : userData.bio,
              main_imageurl: !!mainImageUrl ? mainImageUrl : userData.main_imageurl,
              thumbnail_imageurl: !!thumbnailImageUrl ? thumbnailImageUrl : userData.thumbnail_imageurl
          },
        });

        if(emailToChange){

          const refreshToken = await TokenService.createRefreshToken(req.userId);
          const accessToken = await TokenService.createAccessToken(req.userId, refreshToken.id);

          const confirmationLink = emailConfig.emailConfirmationLink + await TokenService.createEmailToken(req.userId);
          EmailService.sendConfirmationEmail(req.body.email, (usernameToChange) ? req.body.username : userData.username, confirmationLink);

        }

        res.json(new successResponse(
          {
            userId: req.userId
          }
        ));
      }
      catch(error){
        throw new AppError("Cannot edit the user info", 500)
      }
    
        
    }

}




module.exports = UserController;