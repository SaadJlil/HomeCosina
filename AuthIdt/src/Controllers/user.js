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



class AuthController {

    @TryCatchErrorsDecorator
    static async getUserInfo(req, res, next) {
      const userData = await UserDataAccess.GetUserById(req.params.userId);

      res.json(new successResponse(
        {
          userId: userData.id,
          username: userData.username
        }
      ));
      
    }
}




module.exports = AuthController;