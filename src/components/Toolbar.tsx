
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { socket } from "../utils/socket";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Minus,
  Trash2,
  Download,
  Save
} from "lucide-react";

type ToolbarProps = {
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  currentTool: string;
  currentColor: string;
  currentSize: number;
};

const COLORS = [
  "#000000", // Black
  "#ffffff", // White
  "#ff0000", // Red
  "#00ff00", // Green
  "#0000ff", // Blue
  "#ffff00", // Yellow
  "#ff00ff", // Magenta
  "#00ffff", // Cyan
];

const SIZES = [2, 5, 10, 15, 20];

const ToolButton = ({ 
  active, 
  icon: Icon, 
  onClick, 
  tooltip 
}: { 
  active: boolean; 
  icon: any; 
  onClick: () => void; 
  tooltip: string 
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "outline"}
          size="icon"
          className={cn(
            "w-10 h-10 rounded-md transition-all duration-200 hover:scale-110",
            active ? "bg-primary text-primary-foreground shadow-md" : "bg-background"
          )}
          onClick={onClick}
        >
          <Icon className="w-5 h-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const Toolbar = ({
  onToolChange,
  onColorChange,
  onSizeChange,
  currentTool,
  currentColor,
  currentSize,
}: ToolbarProps) => {
  const [showTools, setShowTools] = useState(true);

  const clearCanvas = () => {
    socket.emit("clear-canvas");
  };

  const downloadCanvas = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    // Create a temporary link
    const link = document.createElement("a");
    link.download = `whiteboard-${new Date().toISOString()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed left-1/2 bottom-8 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-3 border border-gray-200">
      <div className="flex items-center space-x-2">
        {/* Drawing Tools */}
        <ToolButton
          active={currentTool === "pencil"}
          icon={Pencil}
          onClick={() => onToolChange("pencil")}
          tooltip="Pencil"
        />
        <ToolButton
          active={currentTool === "line"}
          icon={Minus}
          onClick={() => onToolChange("line")}
          tooltip="Line"
        />
        <ToolButton
          active={currentTool === "rectangle"}
          icon={Square}
          onClick={() => onToolChange("rectangle")}
          tooltip="Rectangle"
        />
        <ToolButton
          active={currentTool === "circle"}
          icon={Circle}
          onClick={() => onToolChange("circle")}
          tooltip="Circle"
        />
        <ToolButton
          active={currentTool === "eraser"}
          icon={Eraser}
          onClick={() => onToolChange("eraser")}
          tooltip="Eraser"
        />

        <Separator orientation="vertical" className="h-10" />

        {/* Color Picker */}
        <div className="flex space-x-1">
          {COLORS.map((color) => (
            <TooltipProvider key={color}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "w-6 h-6 rounded-full transition-transform hover:scale-110",
                      currentColor === color ? "ring-2 ring-primary ring-offset-2" : ""
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{color}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <Separator orientation="vertical" className="h-10" />

        {/* Size Picker */}
        <div className="flex items-center space-x-1">
          {SIZES.map((size) => (
            <TooltipProvider key={size}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "rounded-full transition-transform hover:scale-110 bg-gray-900",
                      currentSize === size ? "ring-2 ring-primary ring-offset-2" : ""
                    )}
                    style={{ 
                      width: size, 
                      height: size,
                    }}
                    onClick={() => onSizeChange(size)}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{size}px</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <Separator orientation="vertical" className="h-10" />

        {/* Canvas Actions */}
        <ToolButton
          active={false}
          icon={Trash2}
          onClick={clearCanvas}
          tooltip="Clear Canvas"
        />
        <ToolButton
          active={false}
          icon={Download}
          onClick={downloadCanvas}
          tooltip="Download as PNG"
        />
      </div>
    </div>
  );
};

export default Toolbar;
