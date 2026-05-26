const { decrypt } = require("../config/encryption");

// Convert encrypted vault files → usable frontend files
const mapVaultFiles = (files = []) => {
    return files.map((file) => ({
        id: file._id,
        originalName: file.originalName,
        fileUrl: decrypt(file.fileUrl),   // 🔓 decrypted for frontend
        publicId: decrypt(file.publicId), // 🔓 decrypted for delete ops
        type: file.type,
        size: file.size,
    }));
};

module.exports = { mapVaultFiles };