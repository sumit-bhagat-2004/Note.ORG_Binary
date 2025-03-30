import React, { useState, useRef, useEffect } from "react";
import Dropzone from "react-dropzone";

const EquationMarker = () => {
    const [image, setImage] = useState(null);
    const [rectangles, setRectangles] = useState([]);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);

    useEffect(() => {
        if (image) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctxRef.current = ctx;
            const img = new Image();
            img.src = image;
            img.onload = () => {
                canvas.width = img.width / 2;
                canvas.height = img.height / 2;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                redrawCanvas();
            };
        }
    }, [image]);

    const handleDrop = (acceptedFiles) => {
        const reader = new FileReader();
        reader.onload = (e) => setImage(e.target.result);
        reader.readAsDataURL(acceptedFiles[0]);
    };

    const handleMouseDown = (e) => {
        setStartX(e.nativeEvent.offsetX);
        setStartY(e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        redrawCanvas();
        const ctx = ctxRef.current;
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.fillRect(startX, startY, e.nativeEvent.offsetX - startX, e.nativeEvent.offsetY - startY);
        ctx.strokeStyle = "red";
        ctx.strokeRect(startX, startY, e.nativeEvent.offsetX - startX, e.nativeEvent.offsetY - startY);
    };

    const handleMouseUp = (e) => {
        setIsDrawing(false);
        setRectangles(prev => [...prev, {
            x: startX,
            y: startY,
            width: e.nativeEvent.offsetX - startX,
            height: e.nativeEvent.offsetY - startY
        }]);
        redrawCanvas();
    };

    const redrawCanvas = () => {
        if (!image) return;
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const img = new Image();
        img.src = image;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            rectangles.forEach(rect => {
                ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
                ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
                ctx.strokeStyle = "red";
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            });
        };
    };

    const saveData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rectangles, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "coordinates.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Math Equation Marker</h2>
            <Dropzone onDrop={handleDrop} accept="image/*">
                {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()} style={{ border: "2px dashed #0087F7", padding: "20px", cursor: "pointer" }}>
                        <input {...getInputProps()} />
                        <p>Drag & Drop an image or click to upload</p>
                    </div>
                )}
            </Dropzone>
            <br />
            <div style={{ display: "inline-block", position: "relative" }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{ border: "2px solid black", cursor: "crosshair" }}
                ></canvas>
            </div>
            <br />
            <button onClick={saveData} style={{ marginTop: "20px", padding: "10px", background: "#28a745", color: "white", border: "none", cursor: "pointer" }}>Save Coordinates</button>
        </div>
    );
};

export default EquationMarker;
