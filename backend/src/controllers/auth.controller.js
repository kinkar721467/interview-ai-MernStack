const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const blacklistModel = require("../models/blacklist.model");

/**
 * @name authRegisterController
 * @description Create a new user, expect username,email,password
 * @access public
 */

async function authRegisterController(req,res) {
    const {username,email,password} = req.body;

    if(!username || !email || !password) {
        return res.status(400).json({
            message: "All input required"
        });
    }

    /* Check user already exist or not */
    const userAlreadyExist = await userModel.findOne({
        $or: [{username},{email}]
    });

    if(userAlreadyExist) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    const hashPassword = await bcrypt.hash(password,10);

    /* create a new user */

    const newUser = await userModel.create({
        username,
        email,
        password: hashPassword
    });

    /* create a jwt token */

    const token = jwt.sign(
        {id: newUser._id,username: newUser.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    );

    /* store the token in cookie */
    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
    });


    res.status(201).json({
        message: "User register sucessfully",
        token: token,
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    });

}

/**
 * @name authLoginController
 * @description Login a user and expected email,password
 * @access public
 */

async function authLoginController(req,res) {

    const {email,password} = req.body;

    if(!email || !password) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const user = await userModel.findOne({email});

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const isValidPassword = await bcrypt.compare(password,user.password);

    if(!isValidPassword) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    /* create a jwt token */

    const token = jwt.sign(
        {id: user._id,username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    );

    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000 // 1 day in ms
    });

    res.status(200).json({
        message: "User login sucessfully",
        token: token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });

}

/**
 * @name authLogoutController
 * @description Logout the user ,clear cookie also blacklisttoken
 * @access public
 */

async function authLogoutController(req,res) {
    const token = req.cookies.token;

    const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

    if(token) {
        await blacklistModel.create({ token });
    }

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction
    });

    res.status(200).json({
        message: "User logout sucessfully"
    })

}

/**
 * @name getUserController
 * @description Get the user details from token
 * @access private
 */

async function getUserController(req,res) {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    authRegisterController,
    authLoginController,
    authLogoutController,
    getUserController
}