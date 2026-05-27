const otpGenerator = require("otp-generator");
const transporter = require("../config/nodemailer");

const resend = require("../config/resend");

const Otp = require("../models/otp.model");
const User = require("../models/user.model");
const Vault = require("../models/valut.model");


// ========================
// SEND OTP
// ========================
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        await Otp.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        // await transporter.sendMail({
        //     from: `"Vault Guard 🔐" <${process.env.EMAIL_USER}>`,
        //     to: email,
        //     subject: "Your Vault OTP 🔐",
        //     html: `
        //         <div style="font-family: Arial; padding:20px;">
        //             <h2>Vault Guard OTP</h2>
        //             <p>Your OTP is:</p>
        //             <h1>${otp}</h1>
        //             <p>Valid for 5 minutes</p>
        //         </div>
        //     `,
        // });
        transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP 🔐",
            html: `<h1>${otp}</h1>`,
        }).then(() => {
            console.log("Email sent");
        }).catch((err) => {
            console.log("Email error:", err);
        });

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
        });

    } catch (error) {
        console.log("Send OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP.",
        });
    }
};


// ========================
// VERIFY OTP + UNLOCK VAULT
// ========================
const verifyOtp = async (req, res) => {
    try {
        const { email, otp, vaultId } = req.body;

        if (!email || !otp || !vaultId) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and vaultId required",
            });
        }

        const otpData = await Otp.findOne({ email, otp })
            .sort({ createdAt: -1 });

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (otpData.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        const vault = await Vault.findById(vaultId);

        if (!vault) {
            return res.status(404).json({
                success: false,
                message: "Vault not found",
            });
        }

        vault.isUnlocked = true;
        vault.status = "unlocked";

        await vault.save();

        await Otp.deleteMany({ email });

        return res.status(200).json({
            success: true,
            message: "Vault unlocked successfully",
            data: vault,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};


module.exports = {
    sendOtp,
    verifyOtp,
};

/*
const otpGenerator = require("otp-generator");
const resend = require("../config/resend");

const Otp = require("../models/otp.model");
const User = require("../models/user.model");
const Vault = require("../models/valut.model");


// ========================
// SEND OTP
// ========================
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        await Otp.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        // ========================
        // RESEND EMAIL SENDING
        // ========================
        const { data, error } = await resend.emails.send({
            from: "Vault Guard <onboarding@resend.dev>",
            to: email,
            subject: "Your Vault OTP 🔐",
            html: `<h1>${otp}</h1>`
        });

        if (error) {
            console.log("Resend Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP email",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully.",
        });

    } catch (error) {
        console.log("Send OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP.",
        });
    }
};


// ========================
// VERIFY OTP + UNLOCK VAULT
// ========================
const verifyOtp = async (req, res) => {
    try {
        const { email, otp, vaultId } = req.body;

        if (!email || !otp || !vaultId) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP and vaultId required",
            });
        }

        const otpData = await Otp.findOne({ email, otp })
            .sort({ createdAt: -1 });

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (otpData.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        const vault = await Vault.findById(vaultId);

        if (!vault) {
            return res.status(404).json({
                success: false,
                message: "Vault not found",
            });
        }

        // TIME CHECK (IMPORTANT)
        const now = new Date();
        if (now < vault.unlockDate) {
            return res.status(403).json({
                success: false,
                message: "Vault is still locked",
            });
        }

        vault.isUnlocked = true;
        vault.status = "unlocked";

        await vault.save();

        await Otp.deleteMany({ email });

        return res.status(200).json({
            success: true,
            message: "Vault unlocked successfully",
            data: vault,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
        });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
};

*/