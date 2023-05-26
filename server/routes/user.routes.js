import express from "express";
import {
  forgotPassword,
  login,
  logout,
  protect,
  register,
  resetPassword,
  restricTo,
  updatePassword,
} from "../controllers/auth.controller.js";
import {
  addAnimeToFavourites,
  deleteUser,
  getAllUsers,
  removeAnimeFromFavourites,
  updateUser,
  updateUserByAdmin,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/updatePassword", protect, updatePassword);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);
router.patch("/updateProfile", protect, updateUser);
router.patch("/addToFavourites/:slug", protect, addAnimeToFavourites);
router.patch("/removeFromFavourites/:slug", protect, removeAnimeFromFavourites);
router.get("/logout", logout);
router.get("/", protect, restricTo("admin"), getAllUsers);
router.patch(
  "/updateTheUser/:id",
  protect,
  restricTo("admin"),
  updateUserByAdmin
);
router.delete("/deleteUser/:id", protect, restricTo("admin"), deleteUser);

export default router;
