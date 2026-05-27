const express = require("express");

const router = express.Router();

const {
    sendOtp,
    verifyOtp,
} = require("../controllers/otp.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/send", verifyToken, sendOtp);

router.post("/verify", verifyToken, verifyOtp);

module.exports = router;