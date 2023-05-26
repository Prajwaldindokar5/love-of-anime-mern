import mongoose from "mongoose";
import Anime from "../models/anime.model.js";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    ratings: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    anime: {
      type: mongoose.Schema.ObjectId,
      ref: "Anime",
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (animeId) {
  const results = await this.aggregate([
    {
      $match: { anime: animeId },
    },
    {
      $group: {
        _id: "$anime",
        totalRatings: { $sum: 1 },
        avgRatings: { $avg: "$ratings" },
      },
    },
  ]);
  await Anime.findByIdAndUpdate(animeId, {
    ratingsAverage: results[0].avgRatings,
    ratingsQuantity: results[0].totalRatings,
  });
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.anime);
});

//findbyIdAndDelete
//findbyIdAndUpdate

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.anime);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
