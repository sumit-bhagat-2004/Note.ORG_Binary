import cloudinary from "../lib/cloudinary.js";
import Note from "../models/notes.models.js";

export const uploadNotes = async (req, res) => {
  try {
    const { userId, subject } = req.body;
    const file = req.file;

    if (!file || !subject) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }

    const uploadResult = await cloudinary.uploader
      .upload_stream(
        {
          resource_type: file.mimetype.startsWith("image/") ? "image" : "pdf",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ message: "Error uploading file" });
          }

          const note = new Note({
            userId,
            fileUrl: result.secure_url,
            fileType: file.mimetype,
            subject,
          });

          await note.save();
          res.status(200).json({
            message: "File uploaded successfully",
            note: {
              id: note._id,
              fileUrl: note.fileUrl,
              fileType: note.fileType,
              subject,
              uploadedAt: note.uploadedAt,
            },
          });
        }
      )
      .end(file.buffer);
  } catch (error) {
    res.status(500).json({ message: "Error uploading notes" });
  }
};
