import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { GameServer } from "./game";
import { insertCharacterSchema, insertGameRoomSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const httpServer = createServer(app);
  const gameServer = new GameServer(httpServer);

  // Character routes
  app.post("/api/characters", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    
    const validatedData = insertCharacterSchema.parse(req.body);
    const character = await storage.createCharacter({
      ...validatedData,
      userId: req.user.id,
    });
    res.status(201).json(character);
  });

  app.get("/api/characters", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const characters = await storage.getCharactersByUserId(req.user.id);
    res.json(characters);
  });

  // Game room routes
  app.post("/api/rooms", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    
    const validatedData = insertGameRoomSchema.parse(req.body);
    const room = await storage.createGameRoom({
      ...validatedData,
      gameMasterId: req.user.id,
    });
    res.status(201).json(room);
  });

  app.get("/api/rooms", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const rooms = await storage.getGameRooms();
    res.json(rooms);
  });

  return httpServer;
}
