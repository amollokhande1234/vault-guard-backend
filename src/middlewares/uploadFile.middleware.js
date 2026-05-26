const multer = require("multer");

const storage = multer.diskStorage({});

const upload = multer({
    storage,

    limits: {
        fileSize: 100 * 1024 * 1024, // 20 MB
        files: 5, // max 5 files
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
            cb(
                new Error(
                    "Invalid file type. Only JPG, PNG, PDF, and MP4 files are allowed."
                )
            );
        }
    },
});

module.exports = upload;

