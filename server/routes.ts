import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCharacterSchema, insertGameRoomSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const httpServer = createServer(app);

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

  // Dice roll route - synchrone au lieu de WebSocket
  app.post("/api/roll", (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const { diceType } = req.body;
    const result = Math.floor(Math.random() * diceType) + 1;
    res.json({ result });
  });

  return httpServer;
}