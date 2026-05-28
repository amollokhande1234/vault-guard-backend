// const Notification = require("../models/notification.model");

// const defaultNotifications = (userId) => [
//     {
//         _id: "default-1",
//         userId,
//         title: "Welcome to Vault Guard 🔐",
//         message: "Start by creating your first secure vault.",
//         type: "SYSTEM",
//         isRead: false,
//         createdAt: new Date(),
//     },
//     {
//         _id: "default-2",
//         userId,
//         title: "Security Tip",
//         message: "Enable OTP unlock for better protection.",
//         type: "SYSTEM",
//         isRead: false,
//         createdAt: new Date(),
//     }
// ];

// // GET ALL NOTIFICATIONS
// const getMyNotifications = async (req, res) => {
//     try {
//         const dbNotifications = await Notification.find({
//             userId: req.user.id,
//         }).sort({ createdAt: -1 });


//         const defaults = defaultNotifications(req.user.id);

//         const notifications = [...defaults, ...dbNotifications];

//         return res.status(200).json({
//             success: true,
//             data: notifications,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch notifications",
//         });
//     }
// };


// const markAsRead = async (req, res) => {
//     try {
//         const notification = await Notification.findOne({
//             _id: req.params.id,
//             userId: req.user.id,   // 🔐 IMPORTANT SECURITY FIX
//         });

//         if (!notification) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Notification not found",
//             });
//         }

//         notification.isRead = true;
//         await notification.save();

//         return res.status(200).json({
//             success: true,
//             message: "Marked as read",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Failed to update notification",
//         });
//     }
// };

// const markAllAsRead = async (req, res) => {
//     try {
//         await Notification.updateMany(
//             { userId: req.user.id },
//             { isRead: true }
//         );

//         return res.status(200).json({
//             success: true,
//             message: "All notifications marked as read",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Failed to update notifications",
//         });
//     }
// };

// const deleteNotification = async (req, res) => {
//     try {
//         const notification = await Notification.findOneAndDelete({
//             _id: req.params.id,
//             userId: req.user.id,   // 🔐 prevent deletion of others
//         });

//         if (!notification) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Notification not found",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Notification deleted",
//         });

//     } catch (error) {
//         return res.status(500).json({
//             message: "Failed to delete notification",
//         });
//     }
// };


// module.exports = {
//     getMyNotifications,
//     markAsRead,
//     markAllAsRead,
//     deleteNotification
// };



const Notification = require("../models/notification.model");

// ===============================
// GET ALL NOTIFICATIONS
// ===============================
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: notifications,
        });

    } catch (error) {
        console.error("getMyNotifications error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

// ===============================
// MARK SINGLE NOTIFICATION AS READ
// ===============================
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id,
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Marked as read",
            data: notification,
        });

    } catch (error) {
        console.error("markAsRead error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};

// ===============================
// MARK ALL NOTIFICATIONS AS READ
// ===============================
const markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            updatedCount: result.modifiedCount,
        });

    } catch (error) {
        console.error("markAllAsRead error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update notifications",
        });
    }
};

// ===============================
// DELETE SINGLE NOTIFICATION
// ===============================
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted",
        });

    } catch (error) {
        console.error("deleteNotification error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};