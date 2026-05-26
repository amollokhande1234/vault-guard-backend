const Vault = require("../models/valut.model");
const cloudinary = require("../config/cloudinary");
const { encrypt, decrypt } = require("../config/encryption");


// CREATE VAULT
const createVault = async (req, res) => {

    try {

        const {
            title,
            description,
            vaultType,
            unlockMethod,
            unlockDate,
            nomineeUserId,
            latitude,
            longitude,
            radiusInMeters,
        } = req.body || {};

        // ===============================
        // BASIC VALIDATIONS
        // ===============================

        // Title
        if (!title || title.trim() === "") {

            return res.status(400).json({
                success: false,
                message: "Vault title is required.",
            });
        }

        // Vault type
        if (!vaultType) {

            return res.status(400).json({
                success: false,
                message:
                    "Please select vault type.",
            });
        }

        // Allowed vault types
        const allowedVaultTypes = [
            "public",
            "private",
        ];

        if (
            !allowedVaultTypes.includes(vaultType)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid vault type selected.",
            });
        }

        // Unlock date
        if (!unlockDate) {

            return res.status(400).json({
                success: false,
                message:
                    "Unlock date is required.",
            });
        }

        // Parse date
        const parsedUnlockDate =
            new Date(unlockDate);

        // Invalid date
        if (
            isNaN(parsedUnlockDate.getTime())
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid unlock date format.",
            });
        }

        // Future date check
        if (
            parsedUnlockDate <= new Date()
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Unlock date must be a future date.",
            });
        }

        // Files required
        if (
            !req.files ||
            req.files.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Please upload at least one file.",
            });
        }

        // Max files
        if (req.files.length > 5) {

            return res.status(400).json({
                success: false,
                message:
                    "Maximum 5 files allowed.",
            });
        }

        // ===============================
        // PRIVATE VAULT VALIDATION
        // ===============================

        if (vaultType === "private") {

            // Unlock method required
            if (!unlockMethod) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please select one unlock method.",
                });
            }

            // Allowed unlock methods
            const allowedUnlockMethods = [
                "otp",
                "biometric",
                "location",
            ];

            if (
                !allowedUnlockMethods.includes(
                    unlockMethod
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid unlock method selected.",
                });
            }

            // Location validation
            if (
                unlockMethod === "location"
            ) {

                if (
                    !latitude ||
                    !longitude
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Latitude and longitude are required.",
                    });
                }

                if (!radiusInMeters) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Radius is required for location unlock.",
                    });
                }
            }
        }

        // ===============================
        // FILE UPLOAD
        // ===============================

        let uploadedFiles = [];

        for (const file of req.files) {

            const result =
                await cloudinary.uploader.upload(
                    file.path,
                    {
                        folder: "vault_files",
                        resource_type: "auto",
                    }
                );

            // uploadedFiles.push({

            //     originalName:
            //         file.originalname,

            //     fileUrl:
            //         result.secure_url,

            //     publicId:
            //         result.public_id,

            //     type:
            //         file.mimetype,

            //     size:
            //         file.size,
            // });

            uploadedFiles.push({
                originalName: file.originalname,

                fileUrl: encrypt(result.secure_url), // 🔐 ENCRYPTED

                publicId: encrypt(result.public_id), // 🔐 ENCRYPTED

                type: file.mimetype,
                size: file.size,
            });
        }

        // ===============================
        // CREATE VAULT
        // ===============================

        const vault =
            await Vault.create({

                ownerId: req.user.id,

                title: title.trim(),

                description,

                files: uploadedFiles,

                vaultType,

                unlockMethod:
                    vaultType === "private"
                        ? unlockMethod
                        : null,

                unlockDate:
                    parsedUnlockDate,

                allowedLocation:
                    unlockMethod === "location"
                        ? {
                            latitude,
                            longitude,
                            radiusInMeters,
                        }
                        : undefined,

                nominee:
                    nomineeUserId
                        ? {
                            nomineeUserId,
                            unlockDate:
                                parsedUnlockDate,
                        }
                        : undefined,

                status: "locked",
            });

        await createNotification({
            userId: req.user.id,
            title: "Vault Created 🔐",
            message: `Your vault "${title}" has been created successfully.`,
            type: "vault_created",
        });

        // ===============================
        // SUCCESS RESPONSE
        // ===============================

        return res.status(201).json({

            success: true,

            message:
                "Vault created successfully.",

            data: vault,
        });

    } catch (error) {

        console.log(
            "Create Vault Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Something went wrong while creating the vault.",
        });
    }
};

// GET ALL VAULTS
const getMyVaults = async (req, res) => {
    try {
        const vaults = await Vault.find({
            ownerId: req.user.id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: vaults,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch vaults",
        });
    }
};


// GET SINGLE VAULT
const getSingleVault = async (req, res) => {
    try {
        const vault = await Vault.findById(req.params.id);

        if (!vault) {
            return res.status(404).json({
                success: false,
                message: "Vault not found",
            });
        }

        const currentDate = new Date();

        // 🔒 CHECK IF LOCKED FIRST
        if (currentDate < vault.unlockDate || vault.status === "locked") {
            return res.status(403).json({
                success: false,
                message: "Vault is still locked",
            });
        }

        // 🔓 MARK AS UNLOCKED (safe update)
        vault.isUnlocked = true;
        vault.status = "unlocked";
        await vault.save();

        // 🔓 DECRYPT ONLY FOR RESPONSE
        const decryptedFiles = vault.files.map((file) => ({
            originalName: file.originalName,
            fileUrl: decrypt(file.fileUrl),
            publicId: decrypt(file.publicId),
            type: file.type,
            size: file.size,
        }));

        return res.status(200).json({
            success: true,
            data: {
                ...vault.toObject(),
                files: decryptedFiles,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch vault",
        });
    }
};


// UPDATE VAULT
const updateVault = async (req, res) => {
    try {
        const { vaultId, otp, updates } = req.body;

        const vault = await Vault.findOne({
            _id: vaultId,
            ownerId: req.user.id,
        });

        if (!vault) {
            return res.status(404).json({
                message: "Vault not found",
            });
        }

        // 1. VERIFY OTP
        const otpRecord = await Otp.findOne({
            email: req.user.email,
            otp,
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }

        // 2. APPLY UPDATE
        Object.assign(vault, updates);

        await vault.save();

        // 3. CLEAN OTP
        await Otp.deleteMany({ email: req.user.email });

        await createNotification({
            userId: req.user.id,
            title: "Vault Created 🔐",
            message: `Your vault "${title}" has been created successfully.`,
            type: "vault_created",
        });

        return res.status(200).json({
            success: true,
            message: "Vault updated successfully",
            data: vault,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Update failed",
        });
    }
};

// DELETE VAULT
const deleteVault = async (req, res) => {
    try {
        const { vaultId, otp } = req.body;

        const vault = await Vault.findOne({
            _id: vaultId,
            ownerId: req.user.id,
        });

        if (!vault) {
            return res.status(404).json({
                message: "Vault not found",
            });
        }

        // VERIFY OTP
        const otpRecord = await Otp.findOne({
            email: req.user.email,
            otp,
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
            });
        }

        // DELETE
        await Vault.findByIdAndDelete(vaultId);

        await Otp.deleteMany({ email: req.user.email });
        await createNotification({
            userId: req.user.id,
            title: "Vault Deleted 🗑️",
            message: `Your vault "${vault.title}" was deleted.`,
            type: "vault_deleted",
        });
        return res.status(200).json({
            success: true,
            message: "Vault deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Delete failed",
        });
    }
};

// UNLOCK VAULT
const unlockVault = async (req, res) => {
    try {
        const {
            vaultId,
            otp,
            biometricVerified,
            latitude,
            longitude,
        } = req.body;

        const vault = await Vault.findById(vaultId);

        if (!vault) {
            return res.status(404).json({
                success: false,
                message: "Vault not found",
            });
        }

        const currentDate = new Date();

        // 1. TIME CHECK
        if (currentDate < vault.unlockDate) {
            return res.status(403).json({
                success: false,
                message: "Vault is still locked (time restriction)",
            });
        }

        // 2. OTP CHECK
        if (vault.unlockMethod === "otp") {

            if (!otp) {
                return res.status(400).json({
                    success: false,
                    message: "OTP is required",
                });
            }

            const otpRecord = await Otp.findOne({
                email: req.user.email,
                otp,
            }).sort({ createdAt: -1 });

            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                });
            }

            if (otpRecord.expiresAt < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "OTP expired",
                });
            }
        }

        // 3. BIOMETRIC CHECK
        if (vault.unlockMethod === "biometric") {
            if (!biometricVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Biometric verification required",
                });
            }
        }

        // 4. LOCATION CHECK
        if (vault.unlockMethod === "location") {

            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: "Location required to unlock vault",
                });
            }

            const distance = getDistance(
                latitude,
                longitude,
                vault.allowedLocation.latitude,
                vault.allowedLocation.longitude
            );

            if (distance > vault.allowedLocation.radiusInMeters) {
                return res.status(403).json({
                    success: false,
                    message: "You are outside allowed location range",
                });
            }
        }

        // 5. SUCCESS → UNLOCK VAULT
        vault.isUnlocked = true;
        vault.status = "unlocked";

        await vault.save();

        // OPTIONAL: delete OTP after success
        await Otp.deleteMany({ email: req.user.email });

        return res.status(200).json({
            success: true,
            message: "Vault unlocked successfully",
            data: vault,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to unlock vault",
        });
    }
};

module.exports = {
    createVault,
    getMyVaults,
    getSingleVault,
    updateVault,
    deleteVault,
    unlockVault,
};