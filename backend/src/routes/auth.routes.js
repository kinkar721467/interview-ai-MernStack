const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access public
 */

authRouter.post("/register",authController.authRegisterController);


/**
 * @route POST /api/auth/login
 * @description Login a existing user with email,password
 * @access public
 */

authRouter.post("/login",authController.authLoginController);

/**
 * @route GET /api/auth/logout
 * @description User logout and blaclist the token , clear cookie
 * @access public
 */

authRouter.get("/logout",authController.authLogoutController);

/**
 * @route GET /api/auth/user
 * @description Get the user details from token
 * @access private
 */

authRouter.get("/get-me",authMiddleware.authUser,authController.getUserController);

module.exports = authRouter;