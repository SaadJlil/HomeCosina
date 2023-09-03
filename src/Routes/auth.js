
const express = require('express');
const AuthController = require('../Controllers/auth');
const AuthMiddleware = require('../Middleware/AuthMiddleware');

const router = express.Router();


router.get("/whatever", (req, res, next) => {
    res.json("hello");
    next();
});
router.post("/signin", AuthController.signin);
router.post("/signup", AuthMiddleware.VerifyEmailPassw, AuthController.signup);



module.exports = router;