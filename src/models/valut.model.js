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
        },

        description: {
            type: String,
        },

        files: [
            {
                originalName: {
                    type: String,
                },

                fileUrl: {
                    type: String,
                },

                publicId: {
                    type: String,
                },

                type: {
                    type: String,
                },

                size: {
                    type: Number,
                },
            },
        ],
        // PUBLIC / PRIVATE
        vaultType: {
            type: String,
            enum: ["public", "private"],
            required: true,
        },

        // ONLY FOR PRIVATE
        unlockMethod: {
            type: String,
            enum: [
                "otp",
                "biometric",
                "location",
            ],
        },

        // LOCATION DATA
        allowedLocation: {
            latitude: Number,
            longitude: Number,
            radiusInMeters: Number,
        },

        unlockDate: {
            type: Date,
            required: true,
        },

        nominee: {
            nomineeUserId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },

            unlockDate: Date,
        },

        isUnlocked: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: [
                "locked",
                "unlocked",
            ],
            default: "locked",
        },

        unlockConditions: {
            otpVerification: {
                type: Boolean,
                default: false,
            },

            biometricVerification: {
                type: Boolean,
                default: false,
            },

            locationVerification: {
                type: Boolean,
                default: false,
            },
        },

        otpMeta: {
            lastOtpSentAt: Date,
            failedAttempts: {
                type: Number,
                default: 0,
            },
            lockedUntil: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Vault",
    vaultSchema
);