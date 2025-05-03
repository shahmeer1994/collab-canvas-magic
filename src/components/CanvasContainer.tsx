
import { useState, useEffect } from "react";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import { socket } from "../utils/socket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CanvasContainer = () => {
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [roomId, setRoomId] = useState("");
  const [userCount, setUserCount] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    // Generate a random room ID if not in the URL
    let id = window.location.pathname.substring(1);
    if (!id) {
      id = Math.random().toString(36).substring(2, 9);
      window.history.pushState({}, '', `/${id}`);
    }
    setRoomId(id);
    
    // Connect to the socket room
    socket.emit("join-room", id);
    
    // Listen for user count updates
    socket.on("user-count", (count) => {
      setUserCount(count);
    });
    
    return () => {
      socket.off("user-count");
    };
  }, []);
  
  const copyRoomLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share this link with others to collaborate",
    });
  };

  return (
    <div className="relative w-full h-screen">
      <Canvas />
      
      <Toolbar
        onToolChange={setTool}
        onColorChange={setColor}
        onSizeChange={setSize}
        currentTool={tool}
        currentColor={color}
        currentSize={size}
      />
      
      {/* Room info card */}
      <Card className="absolute top-4 right-4 p-4 shadow-md bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Room ID: <span className="font-mono">{roomId}</span></p>
            <p className="text-sm text-muted-foreground">{userCount} user{userCount !== 1 ? 's' : ''} connected</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copyRoomLink}>
              <Copy className="h-4 w-4 mr-1" />
              Copy Link
            </Button>
            <Button size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CanvasContainer;
