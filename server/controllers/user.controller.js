import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import AppError from "../utils/appError.js";
import Anime from "../models/anime.model.js";

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(201).json({
    status: "success",
    message: "Profile updated Successfully",
    user,
  });
});

//add Favourite anime
export const addAnimeToFavourites = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.favourites.find((favAnime) => favAnime.slug === req.params.slug)) {
    return next(new AppError("This anime is already in your Favourites.", 400));
  }
  const anime = await Anime.findOne({ slug: req.params.slug }).select(
    "name animeProfile type season ratingsAverage slug"
  );

  if (!anime) {
    return next(new AppError("Anime not found.", 404));
  }

  user.favourites.push(anime);
  await user.save();
  // console.log(user.favourites);

  res.status(200).json({
    status: "success",
    user,
  });
});

//remove Favourite anime
export const removeAnimeFromFavourites = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user.id);

    const animeIndex = user.favourites.findIndex(
      (anime) => anime.slug === req.params.slug
    );
    // console.log(animeIndex);
    if (animeIndex === -1) {
      return next(
        new AppError("The Anime is Not in your Favourites List", 404)
      );
    }
    user.favourites.splice(animeIndex, 1);
    await user.save();

    res.status(200).json({
      status: "success",
      user,
    });
  }
);

// get all users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    users,
  });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("User does not exists", 404));
  }

  res.status(200).json({
    status: "success",
    user: null,
  });
});

export const updateUserByAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(201).json({
    status: "success",
    message: "Profile updated Successfully",
    user,
  });
});
