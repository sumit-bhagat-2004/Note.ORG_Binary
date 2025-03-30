import mongoose from "mongoose";

const rectangleSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
});

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
      default: () => new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000),
    },
    equationCoordinates: {
      type: [rectangleSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
