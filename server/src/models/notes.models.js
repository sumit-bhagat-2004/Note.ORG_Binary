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
