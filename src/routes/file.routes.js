const express = require("express");

const router = express.Router();

const upload = require("../middlewares/uploadFile.middleware");

const {
    verifyToken,
} = require("../middlewares/auth.middleware");

const {
    uploadMultipleFiles,
} = require("../controllers/file.controller");

router.post(
    "/upload",
    verifyToken,
    upload.array("files", 5),
    uploadMultipleFiles
);

module.exports = router;