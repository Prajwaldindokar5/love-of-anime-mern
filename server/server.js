import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import app from "./app.js";
import mongoose from "mongoose";
// import { animes } from "./data/animeData.js";
// import Anime from "./models/anime.model.js";

// connecting database
mongoose.connect(process.env.DB).then(() => {
  console.log(`DataBase Connection Successfull`);
  // Anime.insertMany(animes);
});

//server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server Running On Port ${PORT} `));
