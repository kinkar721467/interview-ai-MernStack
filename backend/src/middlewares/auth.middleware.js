const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }

    try {
        const isBlacklisted = await tokenBlacklistModel.findOne({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        return next();

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }
}

module.exports = {
    authUser
};