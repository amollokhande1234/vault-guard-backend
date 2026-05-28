const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getSingleUser,
    getProfile,
    updateProfile,
    deleteUser,
} = require("../controllers/user.controller");



const { verifyToken } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/uploadFile.middleware");

// ==========================================
// USER ROUTES
// ⚠️ ORDER MATTERS — specific routes must
//    come before wildcard /:userId
// ==========================================

// Get all users
router.get("/all", verifyToken, getAllUsers);

// Get my profile  ← MUST be before /:userId
router.get("/profile/me", verifyToken, getProfile);

// Update profile
router.put("/update", verifyToken, upload.single("profileImage"), updateProfile);

// Delete account
router.delete("/delete", verifyToken, deleteUser);

// Get single user ← MUST be last (wildcard)
router.get("/:userId", verifyToken, getSingleUser);

module.exports = router;