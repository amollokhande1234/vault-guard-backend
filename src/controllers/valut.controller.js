// const Vault = require("../models/valut.model");
// const cloudinary = require("../config/cloudinary");
// const { encrypt } = require("../config/encryption");
// const mapVaultFiles = require("../utils/vaultFileMapper");


// let createNotification;

// try {
//     ({ createNotification } = require("../config/notification"));
// } catch (err) {
//     console.log("Notification service not loaded");
// }

// // CREATE VAULT
// const createVault = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             vaultType,
//             unlockMethod,
//             unlockDate,
//             nomineeUserId,
//             latitude,
//             longitude,
//             radiusInMeters,
//         } = req.body || {};

//         // ===============================
//         // BASIC VALIDATIONS
//         // ===============================

//         if (!title || title.trim() === "") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Vault title is required.",
//             });
//         }

//         if (!vaultType) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please select vault type.",
//             });
//         }

//         const allowedVaultTypes = ["public", "private"];

//         if (!allowedVaultTypes.includes(vaultType)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid vault type selected.",
//             });
//         }

//         if (!unlockDate) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Unlock date is required.",
//             });
//         }

//         const parsedUnlockDate = new Date(unlockDate);

//         if (isNaN(parsedUnlockDate.getTime())) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid unlock date format.",
//             });
//         }

//         if (parsedUnlockDate <= new Date()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Unlock date must be a future date.",
//             });
//         }

//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please upload at least one file.",
//             });
//         }

//         if (req.files.length > 5) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Maximum 5 files allowed.",
//             });
//         }

//         // ===============================
//         // PRIVATE VAULT VALIDATION
//         // ===============================

//         if (vaultType === "private") {
//             if (!unlockMethod) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Please select one unlock method.",
//                 });
//             }

//             const allowedUnlockMethods = [
//                 "otp",
//                 "biometric",
//                 "location",
//             ];

//             if (!allowedUnlockMethods.includes(unlockMethod)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid unlock method selected.",
//                 });
//             }

//             if (unlockMethod === "location") {
//                 if (!latitude || !longitude) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "Latitude and longitude are required.",
//                     });
//                 }

//                 if (!radiusInMeters) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "Radius is required for location unlock.",
//                     });
//                 }
//             }
//         }

//         // ===============================
//         // FILE UPLOAD
//         // ===============================

//         let uploadedFiles = [];

//         for (const file of req.files) {
//             const result = await cloudinary.uploader.upload(file.path, {
//                 folder: "vault_files",
//                 resource_type: "auto",
//             });

//             uploadedFiles.push({
//                 originalName: file.originalname,
//                 // fileUrl: encrypt(result.secure_url),
//                 fileUrl: result.secure_url,
//                 publicId: encrypt(result.public_id),
//                 type: file.mimetype,
//                 size: file.size,
//             });
//         }

//         // ===============================
//         // CREATE VAULT
//         // ===============================

//         const vault = await Vault.create({
//             ownerId: req.user.id,
//             title: title.trim(),
//             description,
//             files: uploadedFiles,
//             vaultType,
//             unlockMethod: vaultType === "private" ? unlockMethod : null,
//             unlockDate: parsedUnlockDate,
//             allowedLocation:
//                 unlockMethod === "location"
//                     ? {
//                         latitude,
//                         longitude,
//                         radiusInMeters,
//                     }
//                     : undefined,
//             nominee: nomineeUserId
//                 ? {
//                     nomineeUserId,
//                     unlockDate: parsedUnlockDate,
//                 }
//                 : undefined,
//             status: "locked",
//         });

//         // ===============================
//         // NOTIFICATION (SAFE)
//         // ===============================

//         if (createNotification) {
//             await createNotification({
//                 userId: req.user.id,
//                 title: "Vault Created 🔐",
//                 message: `Your vault "${title}" has been created successfully.`,
//                 type: "vault_created",
//             });
//         }

//         // ===============================
//         // SUCCESS RESPONSE
//         // ===============================

//         return res.status(201).json({
//             success: true,
//             message: "Vault created successfully.",
//             data: vault,
//         });

//     } catch (error) {
//         console.log("Create Vault Error:", error);

//         return res.status(500).json({
//             success: false,
//             error: error.message,
//             message: "Something went wrong while creating the vault.",
//         });
//     }
// };

// // GET ALL VAULTS
// const getMyVaults = async (req, res) => {
//     try {
//         const vaults = await Vault.find({
//             ownerId: req.user.id,
//         }).sort({ createdAt: -1 });

//         const response = vaults.map(vault => ({
//             ...vault.toObject(),
//             files: mapVaultFiles(vault.files),
//         }));

//         return res.status(200).json({
//             success: true,
//             data: response,
//         });

//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch vaults",
//         });
//     }
// };


// // GET SINGLE VAULT
// const getSingleVault = async (req, res) => {
//     try {
//         const vault = await Vault.findById(req.params.id);

//         if (!vault) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Vault not found",
//             });
//         }

//         // ownership check (IMPORTANT SECURITY)
//         if (vault.ownerId.toString() !== req.user.id) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized access",
//             });
//         }

//         const now = new Date();

//         if (now < vault.unlockDate) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Vault is still locked",
//             });
//         }

//         if (now < vault.unlockDate) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Vault is still locked",
//             });
//         }

//         // auto unlock after time expires
//         if (vault.status === "locked") {
//             vault.status = "unlocked";
//             vault.isUnlocked = true;
//             await vault.save();
//         }

//         if (vault.status === "locked") {
//             vault.status = "unlocked";
//             vault.isUnlocked = true;
//             await vault.save();
//         }

//         // unlock update (safe)
//         vault.isUnlocked = true;
//         vault.status = "unlocked";
//         await vault.save();

//         return res.status(200).json({
//             success: true,
//             data: {
//                 ...vault.toObject(),
//                 files: mapVaultFiles(vault.files), // 🔥 CLEAN OUTPUT
//             },
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch vault",
//         });
//     }
// };


// // UPDATE VAULT
// const updateVault = async (req, res) => {
//     try {
//         const { vaultId, otp, updates } = req.body;

//         const vault = await Vault.findOne({
//             _id: vaultId,
//             ownerId: req.user.id,
//         });

//         if (!vault) {
//             return res.status(404).json({
//                 message: "Vault not found",
//             });
//         }

//         // 1. VERIFY OTP
//         const otpRecord = await Otp.findOne({
//             email: req.user.email,
//             otp,
//         }).sort({ createdAt: -1 });

//         if (!otpRecord || otpRecord.expiresAt < new Date()) {
//             return res.status(400).json({
//                 message: "Invalid or expired OTP",
//             });
//         }

//         // 2. APPLY UPDATE
//         Object.assign(vault, updates);

//         await vault.save();

//         // 3. CLEAN OTP
//         await Otp.deleteMany({ email: req.user.email });

//         await createNotification({
//             userId: req.user.id,
//             title: "Vault Created 🔐",
//             message: `Your vault "${title}" has been created successfully.`,
//             type: "vault_created",
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Vault updated successfully",
//             data: vault,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Update failed",
//         });
//     }
// };

// // DELETE VAULT
// const deleteVault = async (req, res) => {
//     try {
//         const { vaultId, otp } = req.body;

//         const vault = await Vault.findOne({
//             _id: vaultId,
//             ownerId: req.user.id,
//         });

//         if (!vault) {
//             return res.status(404).json({
//                 message: "Vault not found",
//             });
//         }

//         // VERIFY OTP
//         const otpRecord = await Otp.findOne({
//             email: req.user.email,
//             otp,
//         }).sort({ createdAt: -1 });

//         if (!otpRecord || otpRecord.expiresAt < new Date()) {
//             return res.status(400).json({
//                 message: "Invalid or expired OTP",
//             });
//         }

//         // DELETE
//         await Vault.findByIdAndDelete(vaultId);

//         await Otp.deleteMany({ email: req.user.email });
//         await createNotification({
//             userId: req.user.id,
//             title: "Vault Deleted 🗑️",
//             message: `Your vault "${vault.title}" was deleted.`,
//             type: "vault_deleted",
//         });
//         return res.status(200).json({
//             success: true,
//             message: "Vault deleted successfully",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Delete failed",
//         });
//     }
// };

// // UNLOCK VAULT
// const Vault = require("../models/valut.model");
// const cloudinary = require("../config/cloudinary");
// const { encrypt } = require("../config/encryption");
// const mapVaultFiles = require("../utils/vaultFileMapper");


// let createNotification;

// try {
//     ({ createNotification } = require("../config/notification"));
// } catch (err) {
//     console.log("Notification service not loaded");
// }

// // CREATE VAULT
// const createVault = async (req, res) => {
//     try {
//         const {
//             title,
//             description,
//             vaultType,
//             unlockMethod,
//             unlockDate,
//             nomineeUserId,
//             latitude,
//             longitude,
//             radiusInMeters,
//         } = req.body || {};

//         // ===============================
//         // BASIC VALIDATIONS
//         // ===============================

//         if (!title || title.trim() === "") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Vault title is required.",
//             });
//         }

//         if (!vaultType) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please select vault type.",
//             });
//         }

//         const allowedVaultTypes = ["public", "private"];

//         if (!allowedVaultTypes.includes(vaultType)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid vault type selected.",
//             });
//         }

//         if (!unlockDate) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Unlock date is required.",
//             });
//         }

//         const parsedUnlockDate = new Date(unlockDate);

//         if (isNaN(parsedUnlockDate.getTime())) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid unlock date format.",
//             });
//         }

//         if (parsedUnlockDate <= new Date()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Unlock date must be a future date.",
//             });
//         }

//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Please upload at least one file.",
//             });
//         }

//         if (req.files.length > 5) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Maximum 5 files allowed.",
//             });
//         }

//         // ===============================
//         // PRIVATE VAULT VALIDATION
//         // ===============================

//         if (vaultType === "private") {
//             if (!unlockMethod) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Please select one unlock method.",
//                 });
//             }

//             const allowedUnlockMethods = [
//                 "otp",
//                 "biometric",
//                 "location",
//             ];

//             if (!allowedUnlockMethods.includes(unlockMethod)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid unlock method selected.",
//                 });
//             }

//             if (unlockMethod === "location") {
//                 if (!latitude || !longitude) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "Latitude and longitude are required.",
//                     });
//                 }

//                 if (!radiusInMeters) {
//                     return res.status(400).json({
//                         success: false,
//                         message: "Radius is required for location unlock.",
//                     });
//                 }
//             }
//         }

//         // ===============================
//         // FILE UPLOAD
//         // ===============================

//         let uploadedFiles = [];

//         for (const file of req.files) {
//             const result = await cloudinary.uploader.upload(file.path, {
//                 folder: "vault_files",
//                 resource_type: "auto",
//             });

//             uploadedFiles.push({
//                 originalName: file.originalname,
//                 // fileUrl: encrypt(result.secure_url),
//                 fileUrl: result.secure_url,
//                 publicId: encrypt(result.public_id),
//                 type: file.mimetype,
//                 size: file.size,
//             });
//         }

//         // ===============================
//         // CREATE VAULT
//         // ===============================

//         const vault = await Vault.create({
//             ownerId: req.user.id,
//             title: title.trim(),
//             description,
//             files: uploadedFiles,
//             vaultType,
//             unlockMethod: vaultType === "private" ? unlockMethod : null,
//             unlockDate: parsedUnlockDate,
//             allowedLocation:
//                 unlockMethod === "location"
//                     ? {
//                         latitude,
//                         longitude,
//                         radiusInMeters,
//                     }
//                     : undefined,
//             nominee: nomineeUserId
//                 ? {
//                     nomineeUserId,
//                     unlockDate: parsedUnlockDate,
//                 }
//                 : undefined,
//             status: "locked",
//         });

//         // ===============================
//         // NOTIFICATION (SAFE)
//         // ===============================

//         if (createNotification) {
//             await createNotification({
//                 userId: req.user.id,
//                 title: "Vault Created 🔐",
//                 message: `Your vault "${title}" has been created successfully.`,
//                 type: "vault_created",
//             });
//         }

//         // ===============================
//         // SUCCESS RESPONSE
//         // ===============================

//         return res.status(201).json({
//             success: true,
//             message: "Vault created successfully.",
//             data: vault,
//         });

//     } catch (error) {
//         console.log("Create Vault Error:", error);

//         return res.status(500).json({
//             success: false,
//             error: error.message,
//             message: "Something went wrong while creating the vault.",
//         });
//     }
// };

// // GET ALL VAULTS
// const getMyVaults = async (req, res) => {
//     try {
//         const vaults = await Vault.find({
//             ownerId: req.user.id,
//         }).sort({ createdAt: -1 });

//         const response = vaults.map(vault => ({
//             ...vault.toObject(),
//             files: mapVaultFiles(vault.files),
//         }));

//         return res.status(200).json({
//             success: true,
//             data: response,
//         });

//     } catch (error) {
//         console.log(error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch vaults",
//         });
//     }
// };


// // GET SINGLE VAULT
// const getSingleVault = async (req, res) => {
//     try {
//         const vault = await Vault.findById(req.params.id);

//         if (!vault) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Vault not found",
//             });
//         }

//         // ownership check (IMPORTANT SECURITY)
//         if (vault.ownerId.toString() !== req.user.id) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized access",
//             });
//         }

//         const now = new Date();

//         if (now < vault.unlockDate) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Vault is still locked",
//             });
//         }

//         if (now < vault.unlockDate) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Vault is still locked",
//             });
//         }

//         // auto unlock after time expires
//         if (vault.status === "locked") {
//             vault.status = "unlocked";
//             vault.isUnlocked = true;
//             await vault.save();
//         }

//         if (vault.status === "locked") {
//             vault.status = "unlocked";
//             vault.isUnlocked = true;
//             await vault.save();
//         }

//         // unlock update (safe)
//         vault.isUnlocked = true;
//         vault.status = "unlocked";
//         await vault.save();

//         return res.status(200).json({
//             success: true,
//             data: {
//                 ...vault.toObject(),
//                 files: mapVaultFiles(vault.files), // 🔥 CLEAN OUTPUT
//             },
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch vault",
//         });
//     }
// };


// // UPDATE VAULT
// const updateVault = async (req, res) => {
//     try {
//         const { vaultId, otp, updates } = req.body;

//         const vault = await Vault.findOne({
//             _id: vaultId,
//             ownerId: req.user.id,
//         });

//         if (!vault) {
//             return res.status(404).json({
//                 message: "Vault not found",
//             });
//         }

//         // 1. VERIFY OTP
//         const otpRecord = await Otp.findOne({
//             email: req.user.email,
//             otp,
//         }).sort({ createdAt: -1 });

//         if (!otpRecord || otpRecord.expiresAt < new Date()) {
//             return res.status(400).json({
//                 message: "Invalid or expired OTP",
//             });
//         }

//         // 2. APPLY UPDATE
//         Object.assign(vault, updates);

//         await vault.save();

//         // 3. CLEAN OTP
//         await Otp.deleteMany({ email: req.user.email });

//         await createNotification({
//             userId: req.user.id,
//             title: "Vault Created 🔐",
//             message: `Your vault "${title}" has been created successfully.`,
//             type: "vault_created",
//         });

//         return res.status(200).json({
//             success: true,
//             message: "Vault updated successfully",
//             data: vault,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Update failed",
//         });
//     }
// };

// // DELETE VAULT
// const deleteVault = async (req, res) => {
//     try {
//         const { vaultId, otp } = req.body;

//         const vault = await Vault.findOne({
//             _id: vaultId,
//             ownerId: req.user.id,
//         });

//         if (!vault) {
//             return res.status(404).json({
//                 message: "Vault not found",
//             });
//         }

//         // VERIFY OTP
//         const otpRecord = await Otp.findOne({
//             email: req.user.email,
//             otp,
//         }).sort({ createdAt: -1 });

//         if (!otpRecord || otpRecord.expiresAt < new Date()) {
//             return res.status(400).json({
//                 message: "Invalid or expired OTP",
//             });
//         }

//         // DELETE
//         await Vault.findByIdAndDelete(vaultId);

//         await Otp.deleteMany({ email: req.user.email });
//         await createNotification({
//             userId: req.user.id,
//             title: "Vault Deleted 🗑️",
//             message: `Your vault "${vault.title}" was deleted.`,
//             type: "vault_deleted",
//         });
//         return res.status(200).json({
//             success: true,
//             message: "Vault deleted successfully",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Delete failed",
//         });
//     }
// };

// // UNLOCK VAULT
// const unlockVault = async (req, res) => {
//     try {
//         const {
//             vaultId,
//             otp,
//             biometricVerified,
//             latitude,
//             longitude,
//         } = req.body;

//         const vault = await Vault.findById(vaultId);

//         if (!vault) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Vault not found",
//             });
//         }

//         const currentDate = new Date();

//         // 1. TIME CHECK
//         if (currentDate < vault.unlockDate) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Vault is still locked (time restriction)",
//             });
//         }

//         // // 2. OTP CHECK
//         // if (vault.unlockMethod === "otp") {

//         //     if (!otp) {
//         //         return res.status(400).json({
//         //             success: false,
//         //             message: "OTP is required",
//         //         });
//         //     }

//         //     const otpRecord = await Otp.findOne({
//         //         email: req.user.email,
//         //         otp,
//         //     }).sort({ createdAt: -1 });

//         //     if (!otpRecord) {
//         //         return res.status(400).json({
//         //             success: false,
//         //             message: "Invalid OTP",
//         //         });
//         //     }

//         //     if (otpRecord.expiresAt < new Date()) {
//         //         return res.status(400).json({
//         //             success: false,
//         //             message: "OTP expired",
//         //         });
//         //     }
//         // }

//         // 3. BIOMETRIC CHECK
//         if (vault.unlockMethod === "biometric") {
//             if (!biometricVerified) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Biometric verification required",
//                 });
//             }
//         }

//         // 4. LOCATION CHECK
//         // if (vault.unlockMethod === "location") {

//         //     if (!latitude || !longitude) {
//         //         return res.status(400).json({
//         //             success: false,
//         //             message: "Location required to unlock vault",
//         //         });
//         //     }

//         //     const distance = getDistance(
//         //         latitude,
//         //         longitude,
//         //         vault.allowedLocation.latitude,
//         //         vault.allowedLocation.longitude
//         //     );

//         //     if (distance > vault.allowedLocation.radiusInMeters) {
//         //         return res.status(403).json({
//         //             success: false,
//         //             message: "You are outside allowed location range",
//         //         });
//         //     }
//         // }
//         if (vault.unlockMethod === "location") {
//             // 1. Check vault configuration
//             if (!vault.allowedLocation) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Vault location is not configured",
//                 });
//             }

//             // 2. Validate input
//             if (latitude == null || longitude == null) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Location required to unlock vault",
//                 });
//             }

//             // 3. Convert inputs safely
//             const userLat = Number(latitude);
//             const userLng = Number(longitude);

//             const vaultLat = Number(vault.allowedLocation.latitude);
//             const vaultLng = Number(vault.allowedLocation.longitude);

//             const radius = Number(vault.allowedLocation.radiusInMeters);

//             // 4. Validate numbers
//             if (
//                 !Number.isFinite(userLat) ||
//                 !Number.isFinite(userLng) ||
//                 !Number.isFinite(vaultLat) ||
//                 !Number.isFinite(vaultLng)
//             ) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Invalid coordinates provided",
//                 });
//             }

//             if (!Number.isFinite(radius) || radius <= 0) {
//                 return res.status(500).json({
//                     success: false,
//                     message: "Vault radius is not configured properly",
//                 });
//             }

//             // 5. Haversine distance function
//             const getDistance = (lat1, lon1, lat2, lon2) => {
//                 const toRad = (value) => (value * Math.PI) / 180;

//                 const R = 6371000; // meters

//                 const dLat = toRad(lat2 - lat1);
//                 const dLon = toRad(lon2 - lon1);

//                 const a =
//                     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                     Math.cos(toRad(lat1)) *
//                     Math.cos(toRad(lat2)) *
//                     Math.sin(dLon / 2) *
//                     Math.sin(dLon / 2);

//                 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//                 return R * c;
//             };

//             // 6. Calculate distance
//             let distance;

//             try {
//                 distance = getDistance(userLat, userLng, vaultLat, vaultLng);
//             } catch (err) {
//                 console.error("Distance calculation error:", err);
//                 return res.status(500).json({
//                     success: false,
//                     message: "Failed to calculate distance",
//                 });
//             }

//             // 7. Optional safety buffer (GPS drift handling)
//             const SAFE_BUFFER = 10; // meters

//             // 8. Final check
//             if (distance > radius + SAFE_BUFFER) {
//                 return res.status(403).json({
//                     success: false,
//                     message: "You are outside allowed location range",
//                     distance,
//                     allowedRadius: radius,
//                 });
//             }
//         }
//         // 5. SUCCESS → UNLOCK VAULT
//         vault.isUnlocked = true;
//         vault.status = "unlocked";

//         // await vault.save();

//         // // OPTIONAL: delete OTP after success
//         // await Otp.deleteMany({ email: req.user.email });

//         await vault.save();

//         const responseVault = vault.toObject();
//         responseVault.files = mapVaultFiles(responseVault.files);

//         return res.status(200).json({
//             success: true,
//             message: "Vault unlocked successfully",
//             data: responseVault   // ✅ NOT vault
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to unlock vault",
//         });
//     }
// };



// module.exports = {
//     createVault,
//     getMyVaults,
//     getSingleVault,
//     updateVault,
//     deleteVault,
//     unlockVault,
// };


/*

const Vault = require("../models/valut.model");
const Otp = require("../models/otp.model"); // ⚠️ missing import fixed
const cloudinary = require("../config/cloudinary");
const mapVaultFiles = require("../utils/vaultFileMapper");

let createNotification;

try {
    ({ createNotification } = require("../config/notification"));
} catch (err) {
    console.log("Notification service not loaded");
}

// ===============================
// CREATE VAULT (NO ENCRYPTION)
// ===============================
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

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Vault title is required." });
        }

        if (!["public", "private"].includes(vaultType)) {
            return res.status(400).json({ success: false, message: "Invalid vault type." });
        }

        if (!unlockDate) {
            return res.status(400).json({ success: false, message: "Unlock date required." });
        }

        const parsedUnlockDate = new Date(unlockDate);

        if (isNaN(parsedUnlockDate)) {
            return res.status(400).json({ success: false, message: "Invalid date." });
        }

        if (parsedUnlockDate <= new Date()) {
            return res.status(400).json({ success: false, message: "Must be future date." });
        }

        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: "Upload files required." });
        }

        if (req.files.length > 5) {
            return res.status(400).json({ success: false, message: "Max 5 files allowed." });
        }

        let uploadedFiles = [];

        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "vault_files",
                resource_type: "auto",
            });

            // ✅ PUBLIC STORAGE (NO ENCRYPTION)
            uploadedFiles.push({
                originalName: file.originalname,
                fileUrl: result.secure_url,
                publicId: result.public_id,
                type: file.mimetype,
                size: file.size,
            });
        }

        const vault = await Vault.create({
            ownerId: req.user.id,
            title: title.trim(),
            description,
            files: uploadedFiles,
            vaultType,
            unlockMethod: vaultType === "private" ? unlockMethod : null,
            unlockDate: parsedUnlockDate,
            status: "locked",
        });

        if (createNotification) {
            await createNotification({
                userId: req.user.id,
                title: "Vault Created 🔐",
                message: `Vault "${title}" created successfully.`,
                type: "vault_created",
            });
        }

        return res.status(201).json({
            success: true,
            data: vault,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Create failed" });
    }
};

// ===============================
// GET MY VAULTS
// ===============================
const getMyVaults = async (req, res) => {
    try {
        const vaults = await Vault.find({ ownerId: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: vaults.map(v => ({
                ...v.toObject(),
                files: mapVaultFiles(v.files),
            })),
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Fetch failed" });
    }
};

// ===============================
// GET SINGLE VAULT
// ===============================
const getSingleVault = async (req, res) => {
    try {
        const vault = await Vault.findById(req.params.id);

        if (!vault) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        if (vault.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (new Date() < vault.unlockDate) {
            return res.status(403).json({ success: false, message: "Locked" });
        }

        vault.status = "unlocked";
        vault.isUnlocked = true;
        await vault.save();

        return res.status(200).json({
            success: true,
            data: {
                ...vault.toObject(),
                files: mapVaultFiles(vault.files),
            },
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed" });
    }
};

// ===============================
// UPDATE VAULT
// ===============================
const updateVault = async (req, res) => {
    try {
        const { vaultId, otp, updates } = req.body;

        const vault = await Vault.findOne({
            _id: vaultId,
            ownerId: req.user.id,
        });

        if (!vault) {
            return res.status(404).json({ message: "Vault not found" });
        }

        const otpRecord = await Otp.findOne({
            email: req.user.email,
            otp,
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        Object.assign(vault, updates);
        await vault.save();

        await Otp.deleteMany({ email: req.user.email });

        return res.status(200).json({
            success: true,
            message: "Updated",
            data: vault,
        });

    } catch (error) {
        return res.status(500).json({ message: "Update failed" });
    }
};

// ===============================
// DELETE VAULT
// ===============================
const deleteVault = async (req, res) => {
    try {
        const { vaultId, otp } = req.body;

        const vault = await Vault.findOne({
            _id: vaultId,
            ownerId: req.user.id,
        });

        if (!vault) {
            return res.status(404).json({ message: "Not found" });
        }

        const otpRecord = await Otp.findOne({
            email: req.user.email,
            otp,
        }).sort({ createdAt: -1 });

        if (!otpRecord || otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await Vault.findByIdAndDelete(vaultId);
        await Otp.deleteMany({ email: req.user.email });

        return res.status(200).json({
            success: true,
            message: "Deleted",
        });

    } catch (error) {
        return res.status(500).json({ message: "Delete failed" });
    }
};

// ===============================
// UNLOCK VAULT
// ===============================
const unlockVault = async (req, res) => {
    try {
        const { vaultId, biometricVerified, latitude, longitude } = req.body;

        const vault = await Vault.findById(vaultId);

        if (!vault) {
            return res.status(404).json({ message: "Not found" });
        }

        if (new Date() < vault.unlockDate) {
            return res.status(403).json({ message: "Still locked" });
        }

        if (vault.unlockMethod === "biometric" && !biometricVerified) {
            return res.status(400).json({ message: "Biometric required" });
        }

        vault.status = "unlocked";
        vault.isUnlocked = true;
        await vault.save();

        return res.status(200).json({
            success: true,
            data: {
                ...vault.toObject(),
                files: mapVaultFiles(vault.files),
            },
        });

    } catch (error) {
        return res.status(500).json({ message: "Unlock failed" });
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

*/


const Vault = require("../models/valut.model");
// OTP import commented out as requested
// const Otp = require("../models/otp.model");
const cloudinary = require("../config/cloudinary");
const mapVaultFiles = require("../utils/vaultFileMapper");
const User = require("../models/user.model");
// const Vault = require("../models/vault.model");
// OTP import commented out as requested
// const Otp = require("../models/otp.model");


let createNotification;
try {
    ({ createNotification } = require("../config/notification"));
} catch (err) {
    console.log("Notification service not loaded");
}

// ===============================
// HAVERSINE DISTANCE HELPER
// ===============================
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


// ===============================
// TIME REMAINING HELPER
// ===============================
const getTimeRemaining = (unlockDate) => {
    const diff = new Date(unlockDate) - new Date();
    if (diff <= 0) return 'Ready to unlock';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const parts = [];
    if (days) parts.push(days + 'd');
    if (hours) parts.push(hours + 'h');
    if (minutes) parts.push(minutes + 'm');
    return parts.join(' ') || 'Less than a minute';
};
// ===============================
// CREATE VAULT
// Rules:
//  - nominee is REQUIRED (looked up from User model)
//  - public vault: no unlockMethod stored
//  - private vault: unlockMethod required (otp | biometric | location)
//  - location unlock: lat/long/radius stored in allowedLocation (default 100m)
// ===============================
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

        // --- Basic validations ---
        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Vault title is required." });
        }

        if (!["public", "private"].includes(vaultType)) {
            return res.status(400).json({ success: false, message: "Invalid vault type. Must be 'public' or 'private'." });
        }

        if (!unlockDate) {
            return res.status(400).json({ success: false, message: "Unlock date is required." });
        }

        const parsedUnlockDate = new Date(unlockDate);
        if (isNaN(parsedUnlockDate)) {
            return res.status(400).json({ success: false, message: "Invalid unlock date format." });
        }
        if (parsedUnlockDate <= new Date()) {
            return res.status(400).json({ success: false, message: "Unlock date must be in the future." });
        }

        // --- Nominee is OPTIONAL ---
        let nomineeUser = null;
        if (nomineeUserId) {
            nomineeUser = await User.findById(nomineeUserId).select("_id name email");
            if (!nomineeUser) {
                return res.status(404).json({ success: false, message: "Nominee user not found." });
            }
            // if (nomineeUser._id.toString() === req.user.id) {
            //     return res.status(400).json({ success: false, message: "You cannot nominate yourself." });
            // }
        }

        // --- Private vault: unlockMethod required ---
        if (vaultType === "private") {
            if (!unlockMethod || !["otp", "biometric", "location"].includes(unlockMethod)) {
                return res.status(400).json({
                    success: false,
                    message: "Private vault requires a valid unlock method: 'otp', 'biometric', or 'location'.",
                });
            }

            if (unlockMethod === "location") {
                if (latitude === undefined || longitude === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: "Location unlock requires latitude and longitude.",
                    });
                }
            }
        }

        // --- File validations ---
        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: "At least one file is required." });
        }
        if (req.files.length > 5) {
            return res.status(400).json({ success: false, message: "Maximum 5 files allowed." });
        }

        // --- Upload files to Cloudinary ---
        let uploadedFiles = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "vault_files",
                resource_type: "auto",
            });

            uploadedFiles.push({
                originalName: file.originalname,
                fileUrl: result.secure_url,
                publicId: result.public_id,
                type: file.mimetype,
                size: file.size,
            });
        }

        // --- Build vault data ---
        const vaultData = {
            ownerId: req.user.id,
            title: title.trim(),
            description,
            files: uploadedFiles,
            vaultType,
            // Public vaults have no unlock method
            unlockMethod: vaultType === "private" ? unlockMethod : null,
            unlockDate: parsedUnlockDate,
            status: "locked",
        };

        // Only set nominee if one was provided
        if (nomineeUser) {
            vaultData.nominee = {
                nomineeUserId: nomineeUser._id,
                nomineeName: nomineeUser.name,
                nomineeEmail: nomineeUser.email,
                unlockDate: parsedUnlockDate,
            };
        }

        // Store location data for location-based unlock
        if (vaultType === "private" && unlockMethod === "location") {
            vaultData.allowedLocation = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radiusInMeters: radiusInMeters ? parseFloat(radiusInMeters) : 100,
            };
        }

        const vault = await Vault.create(vaultData);

        if (createNotification) {
            await createNotification({
                userId: req.user.id,
                title: "Vault Created 🔐",
                message: `Vault "${title}" created successfully${nomineeUser ? ` with nominee ${nomineeUser.name}` : ""}.`,
                type: "vault_created",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Vault created successfully.",
            data: vault,
        });

    } catch (error) {
        console.error("createVault error:", error);
        return res.status(500).json({ success: false, message: "Failed to create vault." });
    }
};

// ===============================
// GET MY VAULTS (owner)
// ===============================
const getMyVaults = async (req, res) => {
    try {
        const vaults = await Vault.find({ ownerId: req.user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: vaults.map((v) => ({
                ...v.toObject(),
                files: mapVaultFiles(v.files),
            })),
        });

    } catch (error) {
        console.error("getMyVaults error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch vaults." });
    }
};

// ===============================
// GET SINGLE VAULT (owner only, must be past unlockDate)
// ===============================
const getSingleVault = async (req, res) => {
    try {
        const vault = await Vault.findById(req.params.id);

        if (!vault) {
            return res.status(404).json({ success: false, message: "Vault not found." });
        }

        if (vault.ownerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized." });
        }

        if (new Date() < vault.unlockDate) {
            return res.status(403).json({
                success: false,
                message: "This vault is still locked.",
                data: {
                    vaultId: vault._id,
                    title: vault.title,
                    description: vault.description,
                    vaultType: vault.vaultType,
                    unlockMethod: vault.unlockMethod,
                    status: vault.status,
                    unlockDate: vault.unlockDate,
                    unlocksIn: getTimeRemaining(vault.unlockDate),
                    nominee: vault.nominee || null,
                    createdAt: vault.createdAt,
                },
            });
        }

        vault.status = "unlocked";
        vault.isUnlocked = true;
        await vault.save();

        return res.status(200).json({
            success: true,
            data: {
                ...vault.toObject(),
                files: mapVaultFiles(vault.files),
            },
        });

    } catch (error) {
        console.error("getSingleVault error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch vault." });
    }
};

// ===============================
// UPDATE VAULT
// OTP verification commented out as requested.
// Owner can update any field.
// ===============================
const updateVault = async (req, res) => {
    try {
        const { vaultId, updates } = req.body;

        // OTP verification bypassed as requested
        // const { otp } = req.body;
        // const otpRecord = await Otp.findOne({ email: req.user.email, otp }).sort({ createdAt: -1 });
        // if (!otpRecord || otpRecord.expiresAt < new Date()) {
        //     return res.status(400).json({ message: "Invalid OTP" });
        // }
        // await Otp.deleteMany({ email: req.user.email });

        if (!vaultId) {
            return res.status(400).json({ success: false, message: "vaultId is required." });
        }

        if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No updates provided." });
        }

        const vault = await Vault.findOne({ _id: vaultId, ownerId: req.user.id });

        if (!vault) {
            return res.status(404).json({ success: false, message: "Vault not found." });
        }

        // If nominee is being updated, look up the new nominee
        if (updates.nomineeUserId) {
            const nomineeUser = await User.findById(updates.nomineeUserId).select("_id name email");
            if (!nomineeUser) {
                return res.status(404).json({ success: false, message: "Nominee user not found." });
            }
            if (nomineeUser._id.toString() === req.user.id) {
                return res.status(400).json({ success: false, message: "You cannot nominate yourself." });
            }
            updates.nominee = {
                nomineeUserId: nomineeUser._id,
                nomineeName: nomineeUser.name,
                nomineeEmail: nomineeUser.email,
                unlockDate: updates.unlockDate ? new Date(updates.unlockDate) : vault.nominee?.unlockDate,
            };
            delete updates.nomineeUserId;
        }

        // If unlockDate is being updated, validate it
        if (updates.unlockDate) {
            const parsed = new Date(updates.unlockDate);
            if (isNaN(parsed) || parsed <= new Date()) {
                return res.status(400).json({ success: false, message: "Unlock date must be a valid future date." });
            }
            updates.unlockDate = parsed;
        }

        // If vaultType or unlockMethod changes, validate consistency
        const newVaultType = updates.vaultType || vault.vaultType;
        const newUnlockMethod = updates.unlockMethod !== undefined ? updates.unlockMethod : vault.unlockMethod;

        if (newVaultType === "public") {
            updates.unlockMethod = null;
        } else if (newVaultType === "private") {
            if (newUnlockMethod && !["otp", "biometric", "location"].includes(newUnlockMethod)) {
                return res.status(400).json({ success: false, message: "Invalid unlock method." });
            }
        }

        // Handle location update
        if (updates.latitude !== undefined || updates.longitude !== undefined) {
            updates.allowedLocation = {
                latitude: parseFloat(updates.latitude ?? vault.allowedLocation?.latitude),
                longitude: parseFloat(updates.longitude ?? vault.allowedLocation?.longitude),
                radiusInMeters: updates.radiusInMeters
                    ? parseFloat(updates.radiusInMeters)
                    : vault.allowedLocation?.radiusInMeters ?? 100,
            };
            delete updates.latitude;
            delete updates.longitude;
            delete updates.radiusInMeters;
        }

        Object.assign(vault, updates);
        await vault.save();

        return res.status(200).json({
            success: true,
            message: "Vault updated successfully.",
            data: vault,
        });

    } catch (error) {
        console.error("updateVault error:", error);
        return res.status(500).json({ success: false, message: "Failed to update vault." });
    }
};

// ===============================
// DELETE VAULT
// OTP verification commented out as requested.
// Only the owner can delete their vault.
// ===============================
const deleteVault = async (req, res) => {
    try {
        const { vaultId } = req.body;

        // OTP verification bypassed as requested
        // const { otp } = req.body;
        // const otpRecord = await Otp.findOne({ email: req.user.email, otp }).sort({ createdAt: -1 });
        // if (!otpRecord || otpRecord.expiresAt < new Date()) {
        //     return res.status(400).json({ message: "Invalid OTP" });
        // }
        // await Otp.deleteMany({ email: req.user.email });

        if (!vaultId) {
            return res.status(400).json({ success: false, message: "vaultId is required." });
        }

        const vault = await Vault.findOne({ _id: vaultId, ownerId: req.user.id });

        if (!vault) {
            return res.status(404).json({ success: false, message: "Vault not found or you are not the owner." });
        }

        // Delete files from Cloudinary
        for (const file of vault.files) {
            if (file.publicId) {
                try {
                    await cloudinary.uploader.destroy(file.publicId, { resource_type: "auto" });
                } catch (cloudErr) {
                    console.warn(`Failed to delete Cloudinary file ${file.publicId}:`, cloudErr.message);
                }
            }
        }

        await Vault.findByIdAndDelete(vaultId);

        return res.status(200).json({
            success: true,
            message: "Vault deleted successfully.",
        });

    } catch (error) {
        console.error("deleteVault error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete vault." });
    }
};

// ===============================
// UNLOCK VAULT
// Unlock logic per method:
//  - public:    no extra check needed, just unlockDate
//  - otp:       OTP check BYPASSED (commented out)
//  - biometric: biometricVerified must be true in body
//  - location:  compare incoming lat/long with stored allowedLocation (default 100m radius)
// ===============================
const unlockVault = async (req, res) => {
    try {
        const { vaultId, biometricVerified, latitude, longitude } = req.body;

        if (!vaultId) {
            return res.status(400).json({ success: false, message: "vaultId is required." });
        }

        const vault = await Vault.findById(vaultId);

        if (!vault) {
            return res.status(404).json({ success: false, message: "Vault not found." });
        }

        // Must be past the unlock date
        if (new Date() < vault.unlockDate) {
            return res.status(403).json({
                success: false,
                message: "This vault is still locked.",
                data: {
                    vaultId: vault._id,
                    title: vault.title,
                    description: vault.description,
                    vaultType: vault.vaultType,
                    unlockMethod: vault.unlockMethod,
                    status: vault.status,
                    unlockDate: vault.unlockDate,
                    unlocksIn: getTimeRemaining(vault.unlockDate),
                    nominee: vault.nominee || null,
                    createdAt: vault.createdAt,
                },
            });
        }

        // ---- Public vault: no method check needed ----
        if (vault.vaultType === "public") {
            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: "Vault unlocked.",
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        // ---- Private vault: check unlock method ----
        const method = vault.unlockMethod;

        if (method === "otp") {
            // OTP verification bypassed as requested
            // const { otp } = req.body;
            // const otpRecord = await Otp.findOne({ email: req.user.email, otp }).sort({ createdAt: -1 });
            // if (!otpRecord || otpRecord.expiresAt < new Date()) {
            //     return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
            // }
            // await Otp.deleteMany({ email: req.user.email });

            // OTP bypassed — unlock directly
            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: "Vault unlocked (OTP bypassed).",
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        if (method === "biometric") {
            if (!biometricVerified || biometricVerified === false || biometricVerified === "false") {
                return res.status(400).json({
                    success: false,
                    message: "Biometric verification is required to unlock this vault.",
                });
            }

            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: "Vault unlocked via biometric.",
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        if (method === "location") {
            if (latitude === undefined || longitude === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Your current latitude and longitude are required to unlock this vault.",
                });
            }

            const allowed = vault.allowedLocation;
            if (!allowed || allowed.latitude === undefined || allowed.longitude === undefined) {
                return res.status(500).json({
                    success: false,
                    message: "Vault location data is missing. Contact the vault owner.",
                });
            }

            const radius = allowed.radiusInMeters ?? 100; // default 100 meters
            const distance = getDistanceInMeters(
                allowed.latitude,
                allowed.longitude,
                parseFloat(latitude),
                parseFloat(longitude)
            );

            if (distance > radius) {
                return res.status(403).json({
                    success: false,
                    message: `You are ${Math.round(distance)}m away from the allowed location. Must be within ${radius}m.`,
                });
            }

            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: `Vault unlocked. You were ${Math.round(distance)}m from the allowed location.`,
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        // Fallback: unknown unlock method
        return res.status(400).json({ success: false, message: "Unknown unlock method." });

    } catch (error) {
        console.error("unlockVault error:", error);
        return res.status(500).json({ success: false, message: "Failed to unlock vault." });
    }
};

// ===============================
// NOMINEE: GET MY NOMINATED VAULTS
// Returns all vaults where req.user.id is the nominee.
// Shows all vaults; marks which ones can be unlocked (unlockDate passed).
// ===============================
const getNomineeVaults = async (req, res) => {
    try {
        const vaults = await Vault.find({
            "nominee.nomineeUserId": req.user.id,
        }).sort({ createdAt: -1 });

        const now = new Date();

        const data = vaults.map((v) => {
            const obj = v.toObject();
            const canUnlock = now >= v.unlockDate;
            return {
                ...obj,
                files: canUnlock ? mapVaultFiles(v.files) : [], // hide files until unlockDate passed
                canUnlock,
                unlockDate: v.unlockDate,
            };
        });

        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("getNomineeVaults error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch nominated vaults." });
    }
};

// ===============================
// NOMINEE: UNLOCK A NOMINATED VAULT
// Same unlock method logic as unlockVault but
// accessible by the nominee (not just the owner).
// ===============================
const nomineeUnlockVault = async (req, res) => {
    try {
        const { vaultId, biometricVerified, latitude, longitude } = req.body;

        if (!vaultId) {
            return res.status(400).json({ success: false, message: "vaultId is required." });
        }

        const vault = await Vault.findById(vaultId);

        if (!vault) {
            return res.status(404).json({ success: false, message: "Vault not found." });
        }

        // Check that requester is the nominee
        if (!vault.nominee?.nomineeUserId || vault.nominee.nomineeUserId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "You are not the nominee for this vault." });
        }

        // Must be past unlockDate
        if (new Date() < vault.unlockDate) {
            return res.status(403).json({
                success: false,
                message: "This vault is still locked.",
                data: {
                    vaultId: vault._id,
                    title: vault.title,
                    description: vault.description,
                    vaultType: vault.vaultType,
                    unlockMethod: vault.unlockMethod,
                    status: vault.status,
                    unlockDate: vault.unlockDate,
                    unlocksIn: getTimeRemaining(vault.unlockDate),
                    nominee: vault.nominee || null,
                    createdAt: vault.createdAt,
                },
            });
        }

        // Public vault: no method check
        if (vault.vaultType === "public") {
            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: "Vault unlocked.",
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        // Private vault: check method
        const method = vault.unlockMethod;

        if (method === "otp") {
            // OTP bypassed as requested
            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: "Vault unlocked (OTP bypassed).",
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        if (method === "biometric") {
            if (!biometricVerified || biometricVerified === false || biometricVerified === "false") {
                return res.status(400).json({
                    success: false,
                    message: "Biometric verification is required.",
                });
            }

            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: "Vault unlocked via biometric.",
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        if (method === "location") {
            if (latitude === undefined || longitude === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Your current latitude and longitude are required.",
                });
            }

            const allowed = vault.allowedLocation;
            if (!allowed?.latitude || !allowed?.longitude) {
                return res.status(500).json({
                    success: false,
                    message: "Vault location data is missing.",
                });
            }

            const radius = allowed.radiusInMeters ?? 100;
            const distance = getDistanceInMeters(
                allowed.latitude,
                allowed.longitude,
                parseFloat(latitude),
                parseFloat(longitude)
            );

            if (distance > radius) {
                return res.status(403).json({
                    success: false,
                    message: `You are ${Math.round(distance)}m away. Must be within ${radius}m.`,
                });
            }

            vault.status = "unlocked";
            vault.isUnlocked = true;
            await vault.save();

            return res.status(200).json({
                success: true,
                message: `Vault unlocked. You were ${Math.round(distance)}m from the allowed location.`,
                data: { ...vault.toObject(), files: mapVaultFiles(vault.files) },
            });
        }

        return res.status(400).json({ success: false, message: "Unknown unlock method." });

    } catch (error) {
        console.error("nomineeUnlockVault error:", error);
        return res.status(500).json({ success: false, message: "Failed to unlock vault." });
    }
};

module.exports = {
    createVault,
    getMyVaults,
    getSingleVault,
    updateVault,
    deleteVault,
    unlockVault,
    getNomineeVaults,
    nomineeUnlockVault,
};