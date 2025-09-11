import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Example protected route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are authorized!` });
});


// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "EpiCode backend is running!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
