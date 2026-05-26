const cloudinary = require("../config/cloudinary");

const uploadMultipleFiles = async (req, res) => {
    try {

        // ✅ No files uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one file.",
            });
        }

        // ✅ Extra safety check
        if (req.files.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5 files are allowed.",
            });
        }

        const uploadedFiles = [];

        // ✅ Upload files one by one
        for (const file of req.files) {

            try {

                const result = await cloudinary.uploader.upload(
                    file.path,
                    {
                        folder: "value_gate_files",
                        resource_type: "auto",
                    }
                );

                uploadedFiles.push({
                    originalName: file.originalname,
                    fileUrl: result.secure_url,
                    publicId: result.public_id,
                    size: file.size,
                    type: file.mimetype,
                });

            } catch (cloudinaryError) {

                console.log("Cloudinary Upload Error:", cloudinaryError);

                return res.status(500).json({
                    success: false,
                    message: `Failed to upload file: ${file.originalname}`,
                });
            }
        }

        // ✅ Success response
        return res.status(200).json({
            success: true,
            message: "Files uploaded successfully.",
            totalFiles: uploadedFiles.length,
            data: uploadedFiles,
        });

    } catch (error) {

        console.log("Upload Error:", error);

        // ✅ Multer file size error
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size allowed is 20MB.",
            });
        }

        // ✅ Too many files
        if (error.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded. Maximum 5 files allowed.",
            });
        }

        // ✅ Invalid file type
        if (error.message.includes("Invalid file type")) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        // ✅ Generic server error
        return res.status(500).json({
            success: false,
            message: "Something went wrong while uploading files.",
        });
    }
};

module.exports = {
    uploadMultipleFiles,
};