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



class UserController {

    @TryCatchErrorsDecorator
    static async getUserInfo(req, res, next) {
      const userData = await UserDataAccess.GetUserById(req.body.userId);
      const userProfilePic = UserService.GetProfilePic(req.body.userId);

      const userInfo = {
          userId: userData.id,
          username: userData.username
      }

      if (!!userData.bio){
        userInfo.bio = userData.bio
      }


      if (!!userProfilePic){
        userInfo.profilepic = userProfilePic
      }




      res.json(new successResponse(
        userInfo
      ));
      
    }

    @TryCatchErrorsDecorator
    static async editUserInfo(req, res, next) {

      if(!!req.body.profilepic){
        UserService.StoreProfilePic(req.userId, req.body.profilepic.split(',')[1]);
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

}




module.exports = UserController;