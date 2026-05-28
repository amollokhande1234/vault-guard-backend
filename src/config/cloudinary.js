const cloudinary = require("cloudinary").v2;


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    timeout: 120000, // 2 minutes — handles large files and slow connections
});
module.exports = cloudinary;