const jwt = require('jsonwebtoken');

async function verifyToken(req, res, next) {
    try {

        const authHeader = req.headers.authorization;

        // ✅ Check if token exists
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access token is required",
            });
        }

        let token;

        // ✅ Support BOTH formats
        // 1. Bearer TOKEN
        // 2. TOKEN only

        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else {
            token = authHeader;
        }

        // ✅ Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ✅ Attach decoded user
        req.user = decoded;

        next();

    } catch (error) {

        console.log("JWT Error:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
}

module.exports = { verifyToken };