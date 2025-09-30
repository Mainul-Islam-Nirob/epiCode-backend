import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authLimiter } from "../middleware/limiterMiddleware.js";

const router = express.Router();


router.post("/login", authLimiter, loginUser);
router.post("/register", authLimiter, registerUser);

export default router;
