import express from "express";
import {
  CreateReview,
  deleteReview,
  getAllReviews,
} from "../controllers/review.controller.js";
import { protect, restricTo } from "../controllers/auth.controller.js";

const router = express.Router();

//create review on a specif anime
router.post("/:animeId/createReview", protect, restricTo("user"), CreateReview);

//get all reviews on a specific anime
router.get("/:animeId/reviews", protect, getAllReviews);

//deleteReview
router.delete(
  "/:id/deleteReview",
  protect,
  restricTo("admin", "user"),
  deleteReview
);

export default router;
