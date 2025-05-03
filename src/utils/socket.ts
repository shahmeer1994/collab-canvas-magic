
import { io } from "socket.io-client";

// This would connect to your actual server in production
// For local development, we'll mock the socket behavior
export const socket = io("http://localhost:3001", {
  autoConnect: false,
  transports: ['websocket'],
});

// For local development without a server, we'll use a mock implementation
class MockSocketIO {
  private listeners: Record<string, Array<(data: any) => void>> = {};
  private rooms: Record<string, number> = {};
  private currentRoom: string | null = null;

  constructor() {
    // Initialize mock functionality
    this.setupMockBehavior();
  }

  private setupMockBehavior() {
    // Replace the actual socket methods with mock implementations
    socket.on = this.on.bind(this);
    socket.off = this.off.bind(this);
    socket.emit = this.emit.bind(this);
    socket.connect = this.connect.bind(this);
    socket.disconnect = this.disconnect.bind(this);
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return socket;
  }

  off(event: string, callback?: (data: any) => void) {
    if (!this.listeners[event]) return socket;
    
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      delete this.listeners[event];
    }
    return socket;
  }

  emit(event: string, ...args: any[]) {
    console.log(`Mock Socket Emit: ${event}`, args);
    
    // Handle special events
    switch (event) {
      case "join-room":
        const roomId = args[0];
        this.currentRoom = roomId;
        
        if (!this.rooms[roomId]) {
          this.rooms[roomId] = 0;
        }
        this.rooms[roomId]++;
        
        // Notify about user count after a small delay
        setTimeout(() => {
          this.triggerEvent("user-count", this.rooms[roomId]);
        }, 100);
        break;
        
      case "draw":
        // Broadcast drawing events back to all listeners
        if (this.currentRoom) {
          this.triggerEvent("draw", args[0]);
        }
        break;
        
      case "clear-canvas":
        this.triggerEvent("clear-canvas");
        break;
        
      default:
        // No special handling for other events
        break;
    }
    
    return socket;
  }

  connect() {
    console.log("Mock socket connected");
    setTimeout(() => {
      this.triggerEvent("connect");
    }, 100);
    return socket;
  }

  disconnect() {
    console.log("Mock socket disconnected");
    if (this.currentRoom) {
      this.rooms[this.currentRoom]--;
      this.currentRoom = null;
    }
    return socket;
  }

  private triggerEvent(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(...args);
      });
    }
  }
}

// Initialize the mock socket
new MockSocketIO();

// Connect the socket
socket.connect();

export default socket;
