import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";

const UploadNotes = () => {
  const { user } = useUser();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    toast.success("File selected successfully!");
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*,application/pdf",
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) return toast.error("No file selected!");
    if (!user) return toast.error("You must be logged in to upload!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    setUploading(true);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/notes/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("Upload successful!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Upload Your Notes</h2>

      <div
        {...getRootProps()}
        className="border-dashed border-2 border-gray-400 p-6 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        <p>Drag & drop your notes here, or click to select</p>
      </div>

      {preview && (
        <div className="mt-4">
          {file.type.startsWith("image/") ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <p className="text-sm font-medium text-gray-600">
              PDF selected: {file.name}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload Notes"}
      </button>
    </div>
  );
};

export default UploadNotes;
