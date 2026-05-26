const crypto = require("crypto");

const SECRET_KEY = process.env.FILE_SECRET_KEY || "vault_secret_1234567890123456"; // 32 chars
const IV_LENGTH = 16;

// Encrypt
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(SECRET_KEY),
        iv
    );

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Decrypt
const decrypt = (text) => {
    const parts = text.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");

    const decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(SECRET_KEY),
        iv
    );

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
};

module.exports = { encrypt, decrypt };