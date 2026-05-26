const crypto = require("crypto");

const SECRET = process.env.FILE_SECRET_KEY || "vault_secret_1234567890123456"; // 32 chars
// const IV_LENGTH = 16;
// const crypto = require("crypto");

// const SECRET = process.env.ENCRYPTION_KEY;

// 32-byte key fix
const key = crypto.createHash("sha256").update(SECRET).digest();

const iv = Buffer.alloc(16, 0);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

const decrypt = (text) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(text, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};

module.exports = { encrypt, decrypt };