const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS, // App Password only
//     },
// });


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,           // use 587 (TLS) instead of 465 (SSL)
    secure: false,       // true for 465, false for 587
    family: 4,           // 👈 force IPv4
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// console.log("BREVO_USER:", JSON.stringify(process.env.BREVO_USER));
// console.log("BREVO_PASS:", JSON.stringify(process.env.BREVO_PASS));

// const transporter = nodemailer.createTransport({
//     host: "smtp-relay.brevo.com",
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.BREVO_USER,
//         pass: process.env.BREVO_PASS,
//     },
// });


module.exports = transporter;