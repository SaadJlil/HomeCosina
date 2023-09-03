"use strict";

var express = require('express');
var AuthController = require('../Controllers/auth');
var AuthMiddleware = require('../Middleware/AuthMiddleware');
var router = express.Router();
router.get("/whatever", function (req, res, next) {
  res.json("hello");
  next();
});
router.post("/signin", AuthController.signin);
router.post("/signup", AuthMiddleware.VerifyEmailPassw, AuthController.signup);
module.exports = router;