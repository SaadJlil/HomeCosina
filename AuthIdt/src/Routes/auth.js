
const express = require('express');
const AuthController = require('../Controllers/auth');
const AuthMiddleware = require('../Middleware/AuthMiddleware');
const successResponse = require('../Contracts/successResponse')

const router = express.Router();


router.get("/whatever", AuthMiddleware.Authorize, (req, res, next) => {
    res.json("hello");
    next();
});


router.get("/authorize", AuthMiddleware.Authorize(),  (req, res) => {
        res.json(new successResponse({userId: req.userId}))
    }
);

router.post("/signin", AuthMiddleware.VerifyEmailPasswSignIn, AuthController.signin);
router.post("/signup", AuthMiddleware.ValidateSignUp, AuthController.signup);
router.post("/logout", AuthMiddleware.Authorize(false), AuthController.logout);
router.post("/refresh-token", AuthController.refreshTokens);
router.get('/email-confirmation=:token', AuthController.emailConfirmation);
  



//router.delete("/deleteAccount", AuthMiddleware.VerifyEmailPasswSignUp, AuthController.signup);



module.exports = router;