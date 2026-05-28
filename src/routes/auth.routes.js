const express = require("express");

const router = express.Router();

const authController =
    require("../controllers/auth.controller");

const {
    verifyToken
} = require("../middlewares/auth.middleware");


// Public Routes
router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/change-password', verifyToken, authController.changePassword);


module.exports = router;