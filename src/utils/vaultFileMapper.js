const { decrypt } = require("../config/encryption");

const mapVaultFiles = (files = []) => {
    return files.map(file => {

        let fileUrl = file.fileUrl;
        let publicId = file.publicId;

        try {
            fileUrl = decrypt(file.fileUrl);
        } catch (err) {
            console.log("fileUrl already plain text");
        }

        try {
            publicId = decrypt(file.publicId);
        } catch (err) {
            console.log("publicId already plain text");
        }

        return {
            originalName: file.originalName,
            fileUrl,
            publicId,
            type: file.type,
            size: file.size,
        };
    });
};

module.exports = mapVaultFiles;