import mongoose from "mongoose";

const AnimeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: String,
    status: {
      type: String,
      required: true,
      enum: ["Complete", "On Going"],
    },
    season: Number,
    favouriteCharacter: String,
    description: String,
    ratingsAverage: {
      type: Number,
      default: 0,
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    earnings: Number,
    type: Array,
    animeProfile: {
      type: String,
      default: "anime-default.jpg",
    },
    animeCover: {
      type: String,
      default: "anime-default.jpg",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AnimeSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "anime",
});

const Anime = mongoose.model("Anime", AnimeSchema);

export default Anime;
