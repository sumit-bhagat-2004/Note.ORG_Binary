import React, { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const UploadPage = () => {
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

    // Draw the current rectangle - Changed to blue
    ctx.fillStyle = "rgba(59, 130, 246, 0.3)"; // Blue with transparency
    ctx.fillRect(startX, startY, x - startX, y - startY);
    ctx.strokeStyle = "#2563EB"; // Darker blue for border
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

    // Redraw all saved rectangles - Changed to blue
    rectangles.forEach((rect) => {
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)"; // Blue with transparency
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.strokeStyle = "#2563EB"; // Darker blue for border
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
            "https://note-org-binary.onrender.com/api/notes/upload",
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

        const response = await axios.post(
          "http://localhost:8000/api/notes/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-blue-400 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-blue-400 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-blue-400 rounded"></div>
              <div className="h-4 bg-blue-400 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
          <h1 className="text-3xl font-bold tracking-tight">
            Smart Notes Upload
          </h1>
          <p className="mt-2 text-blue-100">
            Upload your notes and mark important equations for processing
          </p>
        </div>

        {!user ? (
          <div className="p-8 bg-gray-50">
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-700">
                    You must be signed in to upload notes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-slate-50">
            <div className="space-y-1">
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Physics, Calculus, Chemistry..."
                required
              />
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors relative
                ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 bg-white"
                }`}
            >
              <input {...getInputProps()} />

              <div className="space-y-3">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0h8m-8 0a4 4 0 01-4-4v-4m32 0v-8a4 4 0 00-4-4h-8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {isDragActive ? (
                  <p className="text-blue-600 font-medium">
                    Drop your file here...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-700 font-medium">
                      Drag & drop a file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: JPG, PNG, PDF
                    </p>
                  </>
                )}
              </div>
            </div>

            {preview && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 shadow-inner">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg
                    className="mr-2 h-5 w-5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Preview & Mark Equations
                </h3>

                <div className="relative inline-block bg-white p-1 border rounded-md shadow-sm">
                  <canvas
                    ref={canvasRef}
                    className="border rounded"
                    style={{
                      display:
                        file?.type === "application/pdf" ? "block" : "none",
                    }}
                  />

                  {file?.type.startsWith("image/") && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full rounded"
                      style={{ display: "block" }}
                      onLoad={handleImageLoad}
                    />
                  )}

                  <canvas
                    ref={drawingLayerRef}
                    className="absolute top-0 left-0 z-10 rounded"
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

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={toggleDrawing}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm
                      ${
                        isDrawing
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {isDrawing ? (
                      <span className="flex items-center">
                        <svg
                          className="mr-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Stop Marking
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg
                          className="mr-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                        Start Marking
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={clearDrawing}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    <span className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Clear Markers
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={saveCoordinates}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                  >
                    <span className="flex items-center">
                      <svg
                        className="mr-1 h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Save Coordinates
                    </span>
                  </button>
                </div>

                <div className="mt-4 bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-indigo-700">
                        Click "Start Marking" and draw rectangles around
                        equations or important areas on your notes. Click "Stop
                        Marking" when done.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !file}
                className={`w-full flex justify-center items-center px-6 py-3 rounded-lg text-white font-medium transition-all
                  ${
                    isLoading || !file
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Notes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
