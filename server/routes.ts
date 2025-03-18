import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCharacterSchema, insertGameRoomSchema, insertItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  const httpServer = createServer(app);

  // Character routes
  app.post("/api/rooms/:roomId/characters", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const validatedData = insertCharacterSchema.parse(req.body);
    const roomId = parseInt(req.params.roomId);

    // Vérifier si la room existe
    const room = await storage.getGameRoom(roomId);
    if (!room) return res.status(404).send("Room not found");

    const character = await storage.createCharacter({
      ...validatedData,
      userId: req.user.id,
      roomId: roomId,
    });
    res.status(201).json(character);
  });

  app.delete("/api/characters/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.deleteCharacter(parseInt(req.params.id));
    res.sendStatus(200);
  });

  app.get("/api/rooms/:roomId/characters", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const roomId = parseInt(req.params.roomId);

    // Si c'est le GM, retourner tous les personnages de la room
    const room = await storage.getGameRoom(roomId);
    if (!room) return res.status(404).send("Room not found");

    if (room.gameMasterId === req.user.id) {
      const characters = await storage.getCharactersByRoomId(roomId);
      return res.json(characters);
    }

    // Sinon, retourner uniquement les personnages du joueur dans cette room
    const characters = await storage.getCharactersByUserAndRoom(req.user.id, roomId);
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

  app.get("/api/rooms/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const roomId = parseInt(req.params.id);
    const room = await storage.getGameRoom(roomId);
    if (!room) return res.status(404).send("Room not found");
    res.json(room);
  });

  // Item routes
  app.post("/api/characters/:characterId/items", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const validatedData = insertItemSchema.parse(req.body);
    const characterId = parseInt(req.params.characterId);

    const item = await storage.createItem({
      ...validatedData,
      characterId,
    });
    res.status(201).json(item);
  });

  app.get("/api/characters/:characterId/items", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const characterId = parseInt(req.params.characterId);
    const items = await storage.getItemsByCharacterId(characterId);
    res.json(items);
  });

  app.delete("/api/items/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    await storage.deleteItem(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Dice roll route
  app.post("/api/roll", (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const { diceType } = req.body;
    const result = Math.floor(Math.random() * diceType) + 1;
    res.json({ result });
  });

  return httpServer;
}