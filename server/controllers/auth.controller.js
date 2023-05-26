import User from "../models/user.model.js";
import AppError from "../utils/appError.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { promisify } from "util";
import Email from "../utils/email.js";
import crypto from "crypto";

const signJwt = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendResponse = (res, user, statusCode, req) => {
  const token = signJwt(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  user.password = undefined;

  res.cookie("jwt", token, cookieOptions).status(statusCode).json({
    status: "success",
    token,
    user: user,
  });
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, photo, passwordChangedAt } = req.body;
  const newUser = new User({
    name,
    email,
    password,
    photo,
    passwordChangedAt,
  });

  await newUser.save();

  sendResponse(res, newUser, 201);
});

export const login = asyncHandler(async (req, res, next) => {
  // getting user email and password
  const { email, password } = req.body;

  // checking email and password
  if (!email && !password) {
    return next(new AppError("Please Enter Email and Password", 401));
  }

  //checking if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.isCorrect(password, user.password))) {
    return next(new AppError("Invalid Credentials", 400));
  }

  //   if everything is correct send token with response
  sendResponse(res, user, 200);
});

//logout
export const logout = (req, res, next) => {
  res.clearCookie("jwt", {
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    status: "success",
    message: "Logot Successfull",
  });
};

//verify token
export const protect = asyncHandler(async (req, res, next) => {
  //getting token
  // let token = req.headers?.authorization?.split(" ")[1];
  const token = req.cookies.jwt;

  // if token does'nt exists
  if (!token) {
    return next(new AppError("User not Logged in, Please login!", 401));
  }
  //verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User does not exists", 404));
  }
  // check password has changed after token has issued
  if (user.isPasswordChanged(decoded.iat)) {
    return next(
      new AppError("Password has changed after login, Please Login again!", 401)
    );
  }

  // if everything is ok
  req.user = user;

  next();
});

//update password
export const updatePassword = asyncHandler(async (req, res, next) => {
  // get current user
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("User does not exists", 404));
  }

  // check currentpassword is correct
  const isCorrect = await bcrypt.compare(
    req.body.currentPassword,
    user.password
  );

  if (!isCorrect) {
    return next(new AppError("current password is not correct", 401));
  }

  user.password = req.body.password;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "Password Updated Successfully",
    user,
  });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  //get mail
  const { email } = req.body;
  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError(`user does'nt exists with that email adress`, 404)
    );
  }
  const token = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `http://localhost:3000/resetPassword/${token}`;
  try {
    new Email(user, resetUrl).sendMail("Forgot Password");

    res.status(200).json({
      token,
      status: "success",
      message: "Email Send Successfully to your registerd email address",
    });
  } catch (error) {
    user.resetTokenExpiresAt = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Fail to send mail", 400));
  }
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  //get reset token
  const { resetToken } = req.params;

  //check if user exists with that reset token
  const token = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: token,
    resetTokenExpiresAt: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Invalid reset token or Token has expired", 401));
  }

  // if everything is ok reset password
  user.password = req.body.password;
  user.resetTokenExpiresAt = undefined;
  user.passwordResetToken = undefined;
  await user.save({ validateBeforeSave: true });

  res.status(200).json({
    status: "success",
    message: "Password Updated Successfully",
  });
});

export const restricTo =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You are not authorized, sorry!", 401));
    }
    next();
  };
