import express from "express";
import {
  // agreegationPipeline,
  createAnime,
  deleteAnime,
  getAllAnimes,
  getAnime,
  updateAnime,
} from "../controllers/anime.controller.js";
import { protect, restricTo } from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(getAllAnimes).post(createAnime);

// router.get("/test", agreegationPipeline);

router.get("/:slug", protect, getAnime);

router
  .route("/:id")
  .patch(protect, restricTo("admin"), updateAnime)
  .delete(protect, restricTo("admin"), deleteAnime);

export default router;
