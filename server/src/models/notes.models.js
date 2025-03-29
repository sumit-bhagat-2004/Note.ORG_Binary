import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
    },
    raw_text_url: {
      type: String,
    },
    corrected_text_url: {
      type: String,
    },
    fileType: {
      type: String,
      enum: ["image/jpeg", "image/png", "application/pdf"],
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
