
const express = require('express');
const UserController = require('../Controllers/user');
const userValidationMiddleware = require('../Middleware/userValidationMiddleware');
const successResponse = require('../Contracts/successResponse')
const AuthMiddleware = require('../Middleware/AuthMiddleware');

const router = express.Router();



router.get('/getUserInfo', userValidationMiddleware.getUserInfo, UserController.getUserInfo);
router.post('/editUserInfo', AuthMiddleware.Authorize(false), userValidationMiddleware.editUserInfo, UserController.editUserInfo);
//router.get('/deleteUser', userValidationMiddleware.getUserInfo, UserController.getUserInfo);
  



//router.delete("/deleteAccount", AuthMiddleware.VerifyEmailPasswSignUp, AuthController.signup);



module.exports = router;