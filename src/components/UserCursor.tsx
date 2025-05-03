
import { useState, useEffect } from "react";
import { socket } from "../utils/socket";
import { cn } from "@/lib/utils";

type Cursor = {
  id: string;
  x: number;
  y: number;
  username: string;
  color: string;
};

const UserCursor = () => {
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});

  useEffect(() => {
    // Listen for cursor updates from other users
    socket.on("cursor-move", (data: { userId: string; cursor: Cursor }) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: data.cursor
      }));
    });

    // Remove disconnected users
    socket.on("user-disconnected", (userId: string) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });

    // Track own cursor movement
    const handleMouseMove = (e: MouseEvent) => {
      const cursor = {
        id: socket.id,
        x: e.clientX,
        y: e.clientY,
        username: "You", // This would come from user profile in a real app
        color: "#3b82f6" // User color
      };
      
      // Throttle cursor position updates
      if (window.cursorUpdateTimeout) {
        clearTimeout(window.cursorUpdateTimeout);
      }
      
      window.cursorUpdateTimeout = setTimeout(() => {
        socket.emit("cursor-move", { cursor });
      }, 100);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      socket.off("cursor-move");
      socket.off("user-disconnected");
      if (window.cursorUpdateTimeout) {
        clearTimeout(window.cursorUpdateTimeout);
      }
    };
  }, []);

  return (
    <>
      {Object.values(cursors).map((cursor) => (
        cursor.id !== socket.id && (
          <div 
            key={cursor.id}
            className={cn(
              "absolute pointer-events-none z-50 select-none",
              "transition-transform duration-100 ease-out"
            )}
            style={{ 
              transform: `translate(${cursor.x}px, ${cursor.y}px)`,
            }}
          >
            {/* Cursor */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={cursor.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
            
            {/* Username label */}
            <div 
              className="absolute top-5 left-2 px-2 py-1 rounded-md text-xs font-medium shadow-sm"
              style={{ backgroundColor: cursor.color, color: '#ffffff' }}
            >
              {cursor.username}
            </div>
          </div>
        )
      ))}
    </>
  );
};

export default UserCursor;
