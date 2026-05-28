// // const mongoose = require('mongoose')

// // const userSchema = mongoose.Schema({
// //     username: {
// //         type: String,
// //         required: true,
// //         unique: true,
// //     },
// //     email: {
// //         type: String,
// //         unique: true,
// //         required: true,
// //     },
// //     password: {
// //         type: String,
// //         required: true,
// //     },
// //     createdAt: {
// //         type: String,

// //         default: Date.now
// //     },
// //     role: {
// //         type: String,
// //         enum: ['user', 'artist'],
// //         default: 'user'
// //     }
// // });

// // const userModel = mongoose.model('user', userSchema);

// // module.exports = userModel;


// const mongoose = require("mongoose");

// const addressSchema = new mongoose.Schema({
//     street: {
//         type: String,
//         default: "",
//     },
//     city: {
//         type: String,
//         default: "",
//     },
//     state: {
//         type: String,
//         default: "",
//     },
//     country: {
//         type: String,
//         default: "",
//     },
//     pincode: {
//         type: String,
//         default: "",
//     },
// });

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

//     // ✅ NEW PROFILE IMAGE
//     profileImage: {
//         type: String,
//         default: "",
//     },

//     // ✅ NEW MOBILE NUMBER
//     mobileNumber: {
//         type: String,
//         default: "",
//     },

//     // ✅ NEW ADDRESS OBJECT
//     address: {
//         type: addressSchema,
//         default: () => ({}),
//     },

//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },

//     role: {
//         type: String,
//         enum: ["user", "artist"],
//         default: "user",
//     },
// });

// const userModel = mongoose.model("user", userSchema);

// module.exports = userModel;


const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    pincode: { type: String, default: "" },
});

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        // Profile image URL (Cloudinary secure_url)
        profileImage: {
            type: String,
            default: "",
        },

        // Cloudinary public_id — needed to delete old image on update/delete
        profileImagePublicId: {
            type: String,
            default: "",
        },

        mobileNumber: {
            type: String,
            default: "",
        },

        address: {
            type: addressSchema,
            default: () => ({}),
        },

        bio: {
            type: String,
            default: "",
            maxlength: 300,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer_not_to_say", ""],
            default: "",
        },

        dateOfBirth: {
            type: Date,
            default: null,
        },

        role: {
            type: String,
            enum: ["user", "artist"],
            default: "user",
        },
    },
    {
        timestamps: true, // gives createdAt + updatedAt automatically
    }
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;