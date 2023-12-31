
const express = require('express');
const AuthMiddleware = require('../Middleware/AuthMiddleware');
const successResponse = require('../Contracts/successResponse');

const router = express.Router();


router.get("/whatever", AuthMiddleware.Authorize, (req, res, next) => {
    res.json(new successResponse("hello"));
});

router.get("/recipe/:id",  (req, res) => res.json(req.params.thing));
//router.post("/signin", AuthMiddleware.VerifyEmailPasswSignIn, AuthController.signin);
//router.post("/logout", AuthMiddleware.Authorize(false), AuthController.logout);
//router.post("/refresh-token", AuthController.refreshTokens);
//router.get('/email-confirmation=:token', AuthController.emailConfirmation);
  



//router.delete("/deleteAccount", AuthMiddleware.VerifyEmailPasswSignUp, AuthController.signup);



module.exports = router;