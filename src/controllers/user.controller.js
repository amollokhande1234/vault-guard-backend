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
        } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            {
                username,
                profileImage,
                mobileNumber,
                address,
            },
            {
                new: true,
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

            message:
                "User deleted successfully.",
        });

    } catch (error) {

        console.log("Delete Error:", error);

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete user.",
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