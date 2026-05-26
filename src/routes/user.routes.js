const express = require("express");

const router = express.Router();

const {

    getAllUsers,

    getSingleUser,

    getProfile,

    updateProfile,

    deleteUser,

} = require("../controllers/user.controller");

const {
    verifyToken,
} = require("../middlewares/auth.middleware");

// ==========================================
// USER ROUTES
// ==========================================

// Get all users
router.get(
    "/all",
    verifyToken,
    getAllUsers
);

// Get single user
router.get(
    "/:userId",
    verifyToken,
    getSingleUser
);

// Get my profile
router.get(
    "/profile/me",
    verifyToken,
    getProfile
);

// Update profile
router.put(
    "/update",
    verifyToken,
    updateProfile
);

// Delete account
router.delete(
    "/delete",
    verifyToken,
    deleteUser
);

module.exports = router;