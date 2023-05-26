import dotenv from "dotenv";
dotenv.config();
import AppError from "../utils/appError.js";

const handleJsonWebTokenError = (err) => {
  return new AppError(
    "Invalid access token or access token has expired, Please Login Again!",
    401
  );
};

const handleCasteError = (err) => {
  const message = `Invalid value: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateField = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `This name is already taken (${value}). Please use another.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    name: err.name,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    // Send specific error message for operational errors
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // For non-operational errors, send a generic error message
    console.error("Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "something went wrong";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.code === 11000) err = handleDuplicateField(err);
    if (err.name === "CastError") err = handleCasteError(err);
    if (err.name === "JsonWebTokenError") err = handleJsonWebTokenError(err);
    sendErrorProd(err, req, res);
  }
};
