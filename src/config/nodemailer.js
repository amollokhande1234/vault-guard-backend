const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    // service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // ← App Password here
        // user: "valuteguard@gmail.com",
        // pass: "ctemwfizsorfpkyq",
    },
});

module.exports = transporter;