// const mongoose = require('mongoose')

// const userSchema = mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     email: {
//         type: String,
//         unique: true,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     createdAt: {
//         type: String,

//         default: Date.now
//     },
//     role: {
//         type: String,
//         enum: ['user', 'artist'],
//         default: 'user'
//     }
// });

// const userModel = mongoose.model('user', userSchema);

// module.exports = userModel;


const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    pincode: {
        type: String,
        default: "",
    },
});

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },

    email: {
        type: String,
        unique: true,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },

    // ✅ NEW PROFILE IMAGE
    profileImage: {
        type: String,
        default: "",
    },

    // ✅ NEW MOBILE NUMBER
    mobileNumber: {
        type: String,
        default: "",
    },

    // ✅ NEW ADDRESS OBJECT
    address: {
        type: addressSchema,
        default: () => ({}),
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    role: {
        type: String,
        enum: ["user", "artist"],
        default: "user",
    },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;