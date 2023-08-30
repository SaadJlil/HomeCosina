
const express = require('express');
const AuthController = require('../Controllers/auth')

const router = express.Router();

router.get("/whatever", (req, res) => res.json("hello"));
router.post("/signin", AuthController.signin);
router.post("/signup", AuthController.signup);



module.exports = router;