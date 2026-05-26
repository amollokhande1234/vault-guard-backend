const express = require("express");
const router = express.Router();

const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controllers/notification.controller");

const {
    verifyToken
} = require("../middlewares/auth.middleware");

// GET ALL NOTIFICATIONS
router.get("/", verifyToken, getMyNotifications);

// MARK SINGLE NOTIFICATION AS READ
router.patch("/:id/read", verifyToken, markAsRead);

// MARK ALL AS READ
router.patch("/read-all", verifyToken, markAllAsRead);

// DELETE NOTIFICATION
router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;