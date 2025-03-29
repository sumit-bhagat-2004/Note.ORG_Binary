import express from "express";
import { protect } from "../middlewares/clerkAuth.js";
import { createUser } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/create-user", protect, createUser);

export default router;
