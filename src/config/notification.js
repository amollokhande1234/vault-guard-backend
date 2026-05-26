const Notification = require("../models/notification.model");

const createNotification = async ({ userId, title, message, type }) => {
    await Notification.create({
        userId,
        title,
        message,
        type,
    });
};

module.exports = createNotification;