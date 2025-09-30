import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import postsRoutes from "./routes/postsRoutes.js";
import tagsRoutes from "./routes/tagsRoutes.js";
import commentsRoutes from "./routes/commentsRoutes.js";
import upvotesRoutes from "./routes/upvotesRoutes.js";




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/posts", upvotesRoutes); 
app.use("/api/tags", tagsRoutes);
app.use("/api", commentsRoutes);



// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "EpiCode backend is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
