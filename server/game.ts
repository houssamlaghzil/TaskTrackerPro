import { WebSocket, WebSocketServer } from "ws";
import { storage } from "./storage";
import type { WebSocketMessage } from "@shared/schema";
import type { Server } from "http";

export class GameServer {
  private wss: WebSocketServer;
  private rooms: Map<number, Set<WebSocket>> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on("connection", (ws: WebSocket) => {
      ws.on("message", async (data: string) => {
        try {
          const message: WebSocketMessage = JSON.parse(data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to handle websocket message:", error);
        }
      });

      ws.on("close", () => {
        this.removeFromAllRooms(ws);
      });
    });
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case "roll":
        this.broadcastToRoom(message.userId, message);
        break;
      case "state_update":
        this.broadcastToRoom(message.userId, message);
        break;
    }
  }

  private broadcastToRoom(roomId: number, message: WebSocketMessage) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const data = JSON.stringify(message);
    room.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private removeFromAllRooms(ws: WebSocket) {
    this.rooms.forEach((room) => {
      room.delete(ws);
    });
  }

  public joinRoom(roomId: number, ws: WebSocket) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);
  }
}
