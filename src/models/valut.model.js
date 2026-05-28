// const mongoose = require("mongoose");

// const vaultSchema = new mongoose.Schema(
//     {
//         ownerId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//         },

//         title: {
//             type: String,
//             required: true,
//         },

//         description: {
//             type: String,
//         },

//         files: [
//             {
//                 originalName: {
//                     type: String,
//                 },

//                 fileUrl: {
//                     type: String,
//                 },

//                 publicId: {
//                     type: String,
//                 },

//                 type: {
//                     type: String,
//                 },

//                 size: {
//                     type: Number,
//                 },
//             },
//         ],
//         // PUBLIC / PRIVATE
//         vaultType: {
//             type: String,
//             enum: ["public", "private"],
//             required: true,
//         },

//         // ONLY FOR PRIVATE
//         unlockMethod: {
//             type: String,
//             enum: [
//                 "otp",
//                 "biometric",
//                 "location",
//             ],
//         },

//         // LOCATION DATA
//         allowedLocation: {
//             latitude: Number,
//             longitude: Number,
//             radiusInMeters: Number,
//         },

//         unlockDate: {
//             type: Date,
//             required: true,
//         },

//         nominee: {
//             nomineeUserId: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "User",
//             },

//             unlockDate: Date,
//         },

//         isUnlocked: {
//             type: Boolean,
//             default: false,
//         },

//         status: {
//             type: String,
//             enum: [
//                 "locked",
//                 "unlocked",
//             ],
//             default: "locked",
//         },

//         unlockConditions: {
//             otpVerification: {
//                 type: Boolean,
//                 default: false,
//             },

//             biometricVerification: {
//                 type: Boolean,
//                 default: false,
//             },

//             locationVerification: {
//                 type: Boolean,
//                 default: false,
//             },
//         },

//         otpMeta: {
//             lastOtpSentAt: Date,
//             failedAttempts: {
//                 type: Number,
//                 default: 0,
//             },
//             lockedUntil: Date,
//         },
//     },
//     {
//         timestamps: true,
//     }
// );

// module.exports = mongoose.model(
//     "Vault",
//     vaultSchema
// );


const mongoose = require("mongoose");

const vaultSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
        },

        files: [
            {
                originalName: { type: String },
                fileUrl: { type: String },
                publicId: { type: String },
                type: { type: String },
                size: { type: Number },
            },
        ],

        // ─── PUBLIC / PRIVATE ───────────────────────────────────────────
        vaultType: {
            type: String,
            enum: ["public", "private"],
            required: true,
        },

        // Only set for private vaults
        unlockMethod: {
            type: String,
            enum: ["otp", "biometric", "location", null],
            default: null,
        },

        // ─── LOCATION DATA (for location-based unlock) ──────────────────
        allowedLocation: {
            latitude: { type: Number },
            longitude: { type: Number },
            radiusInMeters: { type: Number, default: 100 }, // default 100m
        },

        unlockDate: {
            type: Date,
            required: true,
        },

        // ─── NOMINEE ────────────────────────────────────────────────────
        // Required on every vault. Name + email are stored directly
        // (looked up from User at create/update time so they stay accurate
        //  even if the User record changes later).
        nominee: {
            nomineeUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: false,
                default: null,
            },
            // Denormalised for quick display without extra joins
            nomineeName: { type: String },
            nomineeEmail: { type: String },
            unlockDate: { type: Date },
        },

        isUnlocked: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["locked", "unlocked"],
            default: "locked",
        },

        // ─── UNLOCK CONDITIONS (optional flags, kept for compatibility) ──
        unlockConditions: {
            otpVerification: { type: Boolean, default: false },
            biometricVerification: { type: Boolean, default: false },
            locationVerification: { type: Boolean, default: false },
        },

        // ─── OTP META (kept for future use) ─────────────────────────────
        // OTP verification is currently bypassed in all routes.
        otpMeta: {
            lastOtpSentAt: Date,
            failedAttempts: { type: Number, default: 0 },
            lockedUntil: Date,
        },
    },
    {
        timestamps: true,
    }
);

// ─── Index for fast nominee lookups ─────────────────────────────────────────
vaultSchema.index({ "nominee.nomineeUserId": 1 });
vaultSchema.index({ ownerId: 1, createdAt: -1 });

module.exports = mongoose.model("Vault", vaultSchema);