// ================================
// 📁 controllers/auth.controller.js
// ================================

const userModel = require("../models/user.model");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const generateOTP = require("../utils/otp");

const sendEmailOTP = require("../utils/mailler");


// temporary storage
const otpStore = new Map();



// ======================================
// ✅ GENERATE JWT TOKEN
// ======================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username,
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d",
        }
    );
};




// ======================================
// ✅ REGISTER
// ======================================

async function register(req, res) {

    try {

        const {
            username,
            email,
            password
        } = req.body;


        // ✅ Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }


        // ✅ Existing User Check
        const isPresent = await userModel.findOne({
            $or: [
                // { username },
                { email }
            ]
        });


        if (isPresent) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }


        // ✅ Encrypt Password
        const encryptPassword =
            await bcrypt.hash(password, 10);


        // ✅ Create User
        const user = await userModel.create({
            username,
            email,
            password: encryptPassword,
        });


        // ✅ Generate JWT
        const token = generateToken(user);


        // ✅ Response
        return res.status(201).json({
            success: true,
            message: "User registered successfully",

            token,

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (e) {

        console.log("REGISTER ERROR:", e);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}





// ======================================
// ✅ LOGIN
// ======================================

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        // ✅ Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }


        // ✅ User Check
        const user = await userModel.findOne({ email });


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }


        // ✅ Password Compare
        const valid =
            await bcrypt.compare(password, user.password);


        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }


        // ✅ Generate Token
        const token = generateToken(user);


        // ✅ Success Response
        return res.status(200).json({
            success: true,
            message: "Login successful",

            token,

            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        });

    } catch (e) {

        console.log("LOGIN ERROR:", e);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}




// ======================================
// ✅ SEND OTP
// ======================================

async function sendOTP(req, res) {

    try {

        const { email } = req.body;


        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }


        // ✅ Generate OTP
        const otp = generateOTP();


        // ✅ Save OTP
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });


        // ✅ Send Email
        await sendEmailOTP(email, otp);


        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (e) {

        console.log("SEND OTP ERROR:", e);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}




// ======================================
// ✅ VERIFY OTP
// ======================================

async function verifyOTP(req, res) {

    try {

        const {
            email,
            otp
        } = req.body;


        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP required",
            });
        }


        // ✅ Get OTP
        const record = otpStore.get(email);


        if (!record) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        }


        // ✅ Expiry Check
        if (record.expiresAt < Date.now()) {

            otpStore.delete(email);

            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }


        // ✅ OTP Match
        if (record.otp != otp) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }


        // ✅ Remove OTP
        otpStore.delete(email);


        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });

    } catch (e) {

        console.log("VERIFY OTP ERROR:", e);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = {
    register,
    login,
    sendOTP,
    verifyOTP,
};