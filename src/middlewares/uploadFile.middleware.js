const multer = require("multer");
const os = require("os");
const path = require("path");

// Write to OS temp dir so files persist long enough for Cloudinary upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname)}`;
        cb(null, unique);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB per file
        files: 10,
    },

    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "application/pdf",
            "video/mp4",
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only JPG, PNG, PDF, and MP4 files are allowed."));
        }
    },
});

module.exports = upload;    