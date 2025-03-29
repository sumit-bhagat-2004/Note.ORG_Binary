import express from "express";
import { upload } from "../lib/cloudinary.js";
import { uploadNotes } from "../controllers/notes.controller.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadNotes);

export default router;
