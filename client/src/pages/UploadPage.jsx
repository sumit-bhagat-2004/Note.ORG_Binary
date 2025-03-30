import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const uploadPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [subject, setSubject] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [rectangles, setRectangles] = useState([]);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const { user, isLoaded } = useUser();

  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const drawingLayerRef = useRef(null);
  const drawingCtxRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);

    if (
      !["image/jpeg", "image/png", "application/pdf"].includes(
        selectedFile.type
      )
    ) {
      setError("File type not supported. Please upload JPG, PNG or PDF.");
      return;
    }
    setError("");

    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);

    if (selectedFile.type === "application/pdf") {
      renderPdfPreview(previewUrl);
    }

    // Reset rectangles when a new file is dropped
    setRectangles([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const renderPdfPreview = async (url) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvasCtxRef.current = ctx;
    const img = new Image();
    img.src = "/api/placeholder/400/600";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setupDrawingLayer();
    };
  };

  const handleImageLoad = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvasCtxRef.current = ctx;

    canvas.width = e.target.width;
    canvas.height = e.target.height;

    ctx.drawImage(e.target, 0, 0);

    setupDrawingLayer();
  };

  const setupDrawingLayer = () => {
    const canvas = canvasRef.current;
    const drawingLayer = drawingLayerRef.current;

    if (!drawingLayer) return;

    drawingLayer.width = canvas.width;
    drawingLayer.height = canvas.height;

    const drawingCtx = drawingLayer.getContext("2d");
    drawingCtxRef.current = drawingCtx;
  };

  const handleMouseDown = (e) => {
    if (!isDrawing) return;

    const drawingLayer = drawingLayerRef.current;
    if (!drawingLayer) return;

    const rect = drawingLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartX(x);
    setStartY(y);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const drawingLayer = drawingLayerRef.current;
    if (!drawingLayer) return;

    const rect = drawingLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = drawingCtxRef.current;

    // Clear the drawing layer and redraw all saved rectangles
    redrawCanvas();

    // Draw the current rectangle
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(startX, startY, x - startX, y - startY);
    ctx.strokeStyle = "red";
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;

    const drawingLayer = drawingLayerRef.current;
    if (!drawingLayer) return;

    const rect = drawingLayer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Save the rectangle
    setRectangles((prev) => [
      ...prev,
      {
        x: startX,
        y: startY,
        width: x - startX,
        height: y - startY,
      },
    ]);
  };

  const redrawCanvas = () => {
    const drawingLayer = drawingLayerRef.current;
    const ctx = drawingCtxRef.current;

    if (!drawingLayer || !ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, drawingLayer.width, drawingLayer.height);

    // Redraw all saved rectangles
    rectangles.forEach((rect) => {
      ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeStyle = "red";
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
  };

  const toggleDrawing = () => {
    setIsDrawing(!isDrawing);
  };

  const clearDrawing = () => {
    setRectangles([]);
    redrawCanvas();
  };

  const saveCoordinates = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(rectangles, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "coordinates.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const combineCanvases = () => {
    if (!canvasRef.current || !drawingLayerRef.current) return null;

    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = canvasRef.current.width;
    combinedCanvas.height = canvasRef.current.height;

    const ctx = combinedCanvas.getContext("2d");

    ctx.drawImage(canvasRef.current, 0, 0);
    ctx.drawImage(drawingLayerRef.current, 0, 0);

    return combinedCanvas;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !subject) {
      setError("Please select a file and enter a subject");
      return;
    }

    if (!isLoaded || !user) {
      setError("Authentication information not available");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const combinedCanvas = combineCanvases();

      if (combinedCanvas) {
        combinedCanvas.toBlob(async (blob) => {
          const combinedFile = new File([blob], file.name, { type: file.type });

          const formData = new FormData();
          formData.append("file", combinedFile);
          formData.append("subject", subject);
          formData.append("userId", user.id);

          // Also include the rectangle coordinates
          formData.append("coordinates", JSON.stringify(rectangles));

          const response = await axios.post(
            "http://localhost:8000/api/notes/upload",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          setMessage("Notes and equation markers uploaded successfully!");
          setIsLoading(false);

          setFile(null);
          setPreview(null);
          setSubject("");
          setRectangles([]);
        }, file.type);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", subject);
        formData.append("userId", user.id);

        // Include coordinates even without canvas
        formData.append("coordinates", JSON.stringify(rectangles));

        const response = await axios.post("/api/notes/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setMessage("Notes uploaded successfully!");
        setIsLoading(false);
      }
    } catch (error) {
      setError(
        "Error uploading notes: " +
          (error.response?.data?.message || error.message)
      );
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto p-6">Loading user information...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Notes</h1>

      {!user ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            You must be signed in to upload notes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter subject name"
              required
            />
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-blue-500">Drop the file here...</p>
            ) : (
              <div>
                <p className="mb-2">
                  Drag & drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, PDF
                </p>
              </div>
            )}
          </div>

          {preview && (
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">Preview & Mark Equations</h3>

              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  className="border"
                  style={{
                    display:
                      file?.type === "application/pdf" ? "block" : "none",
                  }}
                />

                {file?.type.startsWith("image/") && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full"
                    style={{ display: "block" }}
                    onLoad={handleImageLoad}
                  />
                )}

                <canvas
                  ref={drawingLayerRef}
                  className="absolute top-0 left-0 z-10"
                  style={{
                    display: "block",
                    cursor: isDrawing ? "crosshair" : "default",
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={redrawCanvas}
                />
              </div>

              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={toggleDrawing}
                  className={`px-4 py-2 rounded-md ${
                    isDrawing
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {isDrawing ? "Stop Marking" : "Start Marking"}
                </button>

                <button
                  type="button"
                  onClick={clearDrawing}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Clear Markers
                </button>

                <button
                  type="button"
                  onClick={saveCoordinates}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Coordinates
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Click "Start Marking" and draw rectangles around equations or
                important areas on your notes. Click "Stop Marking" when done.
                You can download the coordinates as JSON.
              </p>
            </div>
          )}

          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}

          <button
            type="submit"
            disabled={isLoading || !file}
            className={`px-6 py-2 rounded-md bg-blue-600 text-white font-medium
              ${
                isLoading || !file
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
          >
            {isLoading ? "Uploading..." : "Upload Notes"}
          </button>
        </form>
      )}
    </div>
  );
};

export default uploadPage;
