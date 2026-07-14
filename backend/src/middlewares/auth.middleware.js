const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
        if (req.originalUrl && req.originalUrl.includes("/get-me")) {
            return res.status(200).json({ user: null, message: "Not authenticated" });
        }
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }

    try {
        const isBlacklisted = await tokenBlacklistModel.findOne({ token });

        if (isBlacklisted) {
            if (req.originalUrl && req.originalUrl.includes("/get-me")) {
                return res.status(200).json({ user: null, message: "Not authenticated" });
            }
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        return next();

    } catch (err) {
        if (req.originalUrl && req.originalUrl.includes("/get-me")) {
            return res.status(200).json({ user: null, message: "Not authenticated" });
        }
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }
}

module.exports = {
    authUser
};