import Review from "../models/review.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";

export const CreateReview = asyncHandler(async (req, res, next) => {
  const { review, ratings } = req.body;

  const newReview = new Review({
    review,
    ratings,
    anime: req.params.animeId,
    user: req.user.id,
  });

  await newReview.save();

  res.status(201).json({
    status: "success",
    newReview,
  });
});

export const getAllReviews = asyncHandler(async (req, res, next) => {
  let filter;
  if (req.params.animeId) filter = { anime: req.params.animeId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    results: reviews.length,
    status: "success",
    reviews,
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError("unable to delete review", 400));
  }
  res.status(200).json({
    status: "success",
    message: "Review Deleted Successfully",
  });
});
