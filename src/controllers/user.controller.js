// const User = require("../models/user.model");

// // ==========================================
// // GET ALL USERS
// // ==========================================

// const getAllUsers = async (req, res) => {

//     try {

//         const users = await User.find()
//             .select("-password");

//         return res.status(200).json({

//             success: true,

//             totalUsers: users.length,

//             data: users,
//         });

//     } catch (error) {

//         console.log("Get Users Error:", error);

//         return res.status(500).json({

//             success: false,

//             message: "Failed to fetch users.",
//         });
//     }
// };

// // ==========================================
// // GET SINGLE USER
// // ==========================================

// const getSingleUser = async (req, res) => {

//     try {

//         const { userId } = req.params;

//         const user = await User.findById(userId)
//             .select("-password");

//         if (!user) {

//             return res.status(404).json({

//                 success: false,

//                 message: "User not found.",
//             });
//         }

//         return res.status(200).json({

//             success: true,

//             data: user,
//         });

//     } catch (error) {

//         console.log("Get User Error:", error);

//         return res.status(500).json({

//             success: false,

//             message: "Failed to fetch user.",
//         });
//     }
// };

// // ==========================================
// // GET PROFILE
// // ==========================================

// const getProfile = async (req, res) => {

//     try {

//         const user = await User.findById(req.user.id)
//             .select("-password");

//         if (!user) {

//             return res.status(404).json({

//                 success: false,

//                 message: "User not found.",
//             });
//         }

//         return res.status(200).json({

//             success: true,

//             data: user,
//         });

//     } catch (error) {

//         console.log("Profile Error:", error);

//         return res.status(500).json({

//             success: false,

//             message: "Failed to fetch profile.",
//         });
//     }
// };

// // ==========================================
// // UPDATE PROFILE
// // ==========================================

// const updateProfile = async (req, res) => {
//     try {

//         const {
//             username,
//             profileImage,
//             mobileNumber,
//             address,
//         } = req.body;

//         const updatedUser = await User.findByIdAndUpdate(
//             req.user.id,
//             {
//                 username,
//                 profileImage,
//                 mobileNumber,
//                 address,
//             },
//             {
//                 new: true,
//             }
//         ).select("-password");

//         return res.status(200).json({
//             success: true,
//             message: "Profile updated successfully.",
//             data: updatedUser,
//         });

//     } catch (error) {

//         console.log("Update Error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Failed to update profile.",
//         });
//     }
// };
// // ==========================================
// // DELETE USER
// // ==========================================

// const deleteUser = async (req, res) => {

//     try {

//         await User.findByIdAndDelete(req.user.id);

//         return res.status(200).json({

//             success: true,

//             message:
//                 "User deleted successfully.",
//         });

//     } catch (error) {

//         console.log("Delete Error:", error);

//         return res.status(500).json({

//             success: false,

//             message:
//                 "Failed to delete user.",
//         });
//     }
// };

// module.exports = {

//     getAllUsers,

//     getSingleUser,

//     getProfile,

//     updateProfile,

//     deleteUser,
// };



/*

const User = require("../models/user.model");

// ==========================================
// GET ALL USERS
// ==========================================

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password");

        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            data: users,
        });

    } catch (error) {

        console.log("Get Users Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};

// ==========================================
// GET SINGLE USER
// ==========================================

const getSingleUser = async (req, res) => {

    try {

        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {

        console.log("Get User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch user.",
        });
    }
};

// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {

        console.log("Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (req, res) => {

    try {

        const {
            username,
            profileImage,
            mobileNumber,
            address,
            bio,
            gender,
            dateOfBirth,
        } = req.body;

        const updateData = {};

        // ONLY UPDATE PROVIDED FIELDS

        if (username !== undefined)
            updateData.username = username;

        if (profileImage !== undefined)
            updateData.profileImage = profileImage;

        if (mobileNumber !== undefined)
            updateData.mobileNumber = mobileNumber;

        if (address !== undefined)
            updateData.address = address;

        if (bio !== undefined)
            updateData.bio = bio;

        if (gender !== undefined)
            updateData.gender = gender;

        if (dateOfBirth !== undefined)
            updateData.dateOfBirth = dateOfBirth;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
        });

    } catch (error) {

        console.log("Update Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile.",
        });
    }
};

// ==========================================
// DELETE USER
// ==========================================

const deleteUser = async (req, res) => {

    try {

        await User.findByIdAndDelete(req.user.id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });

    } catch (error) {

        console.log("Delete Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete user.",
        });
    }
};

module.exports = {
    getAllUsers,
    getSingleUser,
    getProfile,
    updateProfile,
    deleteUser,
};

*/


const User = require("../models/user.model");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// ==========================================
// GET ALL USERS
// ==========================================
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            data: users,
        });

    } catch (error) {
        console.log("Get Users Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users.",
        });
    }
};

// ==========================================
// GET SINGLE USER
// ==========================================
const getSingleUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        console.log("Get User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user.",
        });
    }
};

// ==========================================
// GET PROFILE
// ==========================================
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error) {
        console.log("Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch profile.",
        });
    }
};

// ==========================================
// UPDATE PROFILE
// Accepts multipart/form-data.
// All fields are optional — only provided
// fields get updated.
// If a profile image file is sent, it is
// uploaded to Cloudinary and the old image
// is deleted from Cloudinary automatically.
// ==========================================
const updateProfile = async (req, res) => {
    try {
        const {
            username,
            mobileNumber,
            address,
            bio,
            gender,
            dateOfBirth,
        } = req.body;

        // Build update object with only provided fields
        const updateData = {};

        if (username !== undefined) updateData.username = username.trim();
        if (mobileNumber !== undefined) updateData.mobileNumber = mobileNumber;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;
        if (gender !== undefined) updateData.gender = gender;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);

        // ── Profile image upload ──────────────────────────────────────
        if (req.file) {
            // Fetch current user to check for existing Cloudinary image
            const currentUser = await User.findById(req.user.id).select("profileImage profileImagePublicId");

            // Delete old image from Cloudinary if it exists
            if (currentUser?.profileImagePublicId) {
                try {
                    await cloudinary.uploader.destroy(currentUser.profileImagePublicId);
                } catch (cloudErr) {
                    console.warn("Failed to delete old profile image:", cloudErr.message);
                }
            }

            // Upload new image
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "profile_images",
                resource_type: "image",
                transformation: [
                    { width: 400, height: 400, crop: "fill", gravity: "face" },
                    { quality: "auto", fetch_format: "auto" },
                ],
            });

            // Clean up temp file from disk
            try { fs.unlinkSync(req.file.path); } catch (_) { }

            updateData.profileImage = result.secure_url;
            updateData.profileImagePublicId = result.public_id;
        }

        // Nothing to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields provided to update.",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: updatedUser,
        });

    } catch (error) {
        // Clean up temp file if upload failed mid-way
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (_) { }
        }

        console.log("Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile.",
        });
    }
};

// ==========================================
// DELETE USER
// ==========================================
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("profileImagePublicId");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Delete profile image from Cloudinary if it exists
        if (user.profileImagePublicId) {
            try {
                await cloudinary.uploader.destroy(user.profileImagePublicId);
            } catch (cloudErr) {
                console.warn("Failed to delete profile image on account delete:", cloudErr.message);
            }
        }

        await User.findByIdAndDelete(req.user.id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });

    } catch (error) {
        console.log("Delete Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete user.",
        });
    }
};

module.exports = {
    getAllUsers,
    getSingleUser,
    getProfile,
    updateProfile,
    deleteUser,
};