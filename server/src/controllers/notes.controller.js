import cloudinary from "../lib/cloudinary.js";
import Note from "../models/notes.models.js";

export const uploadNotes = async (req, res) => {
  try {
    const { userId, subject, coordinates } = req.body;
    const file = req.file;

    if (!file || !subject) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }

    let parsedCoordinates = [];
    if (coordinates) {
      try {
        parsedCoordinates = JSON.parse(coordinates);
      } catch (error) {
        console.error("Error parsing coordinates:", error);
      }
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
            equationCoordinates: parsedCoordinates,
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
              equationCoordinates: note.equationCoordinates,
            },
          });
        }
      )
      .end(file.buffer);
  } catch (error) {
    console.error("Error in uploadNotes:", error);
    res.status(500).json({ message: "Error uploading notes" });
  }
};

export const getNotesWithCorrectedText = async (req, res) => {
  try {
    const notes = await Note.find({
      corrected_text_url: { $exists: true, $ne: "" },
    });
    res.status(200).json(notes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notes", error: error.message });
  }
};
