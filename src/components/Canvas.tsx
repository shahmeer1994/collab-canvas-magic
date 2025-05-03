
import { useRef, useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { cn } from "@/lib/utils";

type Point = {
  x: number;
  y: number;
};

type DrawingData = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
  size: number;
  tool: string;
};

const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState("pencil");
  
  // Points for current drawing path
  const prevPoint = useRef<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Handle window resize
    const handleResize = () => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      context.putImageData(imageData, 0, 0);
    };

    window.addEventListener("resize", handleResize);

    // Socket event listeners for drawing
    socket.on("draw", (data: DrawingData) => {
      if (!context) return;
      drawLine(data.prevPoint, data.currentPoint, data.color, data.size, data.tool, context);
    });

    socket.on("clear-canvas", () => {
      if (!context) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("draw");
      socket.off("clear-canvas");
    };
  }, []);

  const drawLine = (
    prevPoint: Point | null,
    currentPoint: Point,
    color: string,
    size: number,
    tool: string,
    context: CanvasRenderingContext2D
  ) => {
    // Start a new path
    context.beginPath();
    
    // Style settings
    context.lineWidth = size;
    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineJoin = "round";

    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.lineWidth = size * 2; // Make eraser slightly larger
    } else {
      context.globalCompositeOperation = "source-over";
    }

    if (prevPoint) {
      // Move to the previous position
      context.moveTo(prevPoint.x, prevPoint.y);
      // Draw a line to the current position
      context.lineTo(currentPoint.x, currentPoint.y);
      // Make the line visible
      context.stroke();
    } else {
      // If there's no previous point, just draw a dot
      context.arc(currentPoint.x, currentPoint.y, size / 2, 0, 2 * Math.PI);
      context.fill();
    }
    
    context.closePath();
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const currentPoint = { x: e.clientX, y: e.clientY };
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    prevPoint.current = currentPoint;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const currentPoint = { x: e.clientX, y: e.clientY };
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d");
    if (!context) return;

    drawLine(prevPoint.current, currentPoint, color, size, tool, context);
    
    // Emit drawing data to server
    socket.emit("draw", {
      prevPoint: prevPoint.current,
      currentPoint,
      color,
      size,
      tool,
    });
    
    prevPoint.current = currentPoint;
  };

  const onMouseUp = () => {
    setIsDrawing(false);
    prevPoint.current = null;
  };

  // Also handle touch events for mobile
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    onMouseDown(mouseEvent as any);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    onMouseMove(mouseEvent as any);
  };

  const onTouchEnd = () => {
    onMouseUp();
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute top-0 left-0 w-full h-full z-0 touch-none",
        tool === "eraser" ? "cursor-not-allowed" : "cursor-crosshair"
      )}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
};

export default Canvas;
