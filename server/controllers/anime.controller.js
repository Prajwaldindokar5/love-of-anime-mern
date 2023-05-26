import Anime from "../models/anime.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import ApiFeatures from "../utils/apiFeatures.js";

//create anime

export const getAllAnimes = asyncHandler(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Anime, req.query)
    .filter()
    .sort()
    .fields()
    .page();
  const animes = await apiFeatures.query;
  res.status(200).json({
    results: animes.length,
    status: "success",
    animes,
  });
});

export const createAnime = asyncHandler(async (req, res, next) => {
  const {
    name,
    slug,
    description,
    status,
    season,
    favouriteCharacter,
    earnings,
    type,
    animeProfile,
    animeCover,
  } = req.body;
  const newAnime = new Anime({
    name,
    slug,
    status,
    description,
    season,
    favouriteCharacter,
    earnings,
    type,
    animeCover,
    animeProfile,
  });

  await newAnime.save();

  res.status(201).json({
    status: "success",
    newAnime,
  });
});

export const getAnime = asyncHandler(async (req, res, next) => {
  const slug = req.params.slug;
  const anime = await Anime.findOne({ slug }).populate("reviews");
  if (!anime) {
    return next(new AppError("Unable to get Anime", 404));
  }

  res.status(200).json({
    status: "success",
    anime,
  });
});

export const updateAnime = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const anime = await Anime.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!anime) {
    return next(new AppError("Unable to get Anime", 404));
  }

  res.status(201).json({
    status: "success",
    anime,
  });
});

export const deleteAnime = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const anime = await Anime.findByIdAndDelete(id);
  if (!anime) {
    return next(new AppError("Unable to get Anime", 404));
  }

  await anime.deleteOne();

  res.status(200).json({
    status: "success",
    message: "Anime Deleted Successfully",
  });
});

// export const agreegationPipeline = async (req, res, next) => {
//   const test = await Anime.aggregate([
//     { $unwind: "$type" },
//     {
//       $match: { status: "On Going" },
//     },
//     {
//       $group: {
//         _id: "$type",
//         total: {
//           $sum: "$season",
//         },
//       },
//     },
//     {
//       $sort: { total: -1 },
//     },
//     {
//       $addFields: { type: "$_id" },
//     },
//     {
//       $project: { _id: 0 },
//     },
//   ]);

//   res.status(200).json({
//     test,
//   });
// };
