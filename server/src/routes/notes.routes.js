import express from "express";
import { upload } from "../lib/cloudinary.js";
import {
  getNotesWithCorrectedText,
  uploadNotes,
} from "../controllers/notes.controller.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadNotes);
router.get("/get-notes", getNotesWithCorrectedText);

export default router;
