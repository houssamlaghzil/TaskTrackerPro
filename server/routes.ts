import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCharacterSchema, insertGameRoomSchema, insertItemSchema, insertDonationSchema } from "@shared/schema";
import cors from "cors";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: true,
    credentials: true
  }));

  setupAuth(app);
  const httpServer = createServer(app);

  // Stripe payment route
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, donorNickname } = req.body;

      if (!req.user) return res.sendStatus(401);

      const validatedData = insertDonationSchema.parse({
        amount: amount * 100,
        donorNickname
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: validatedData.amount,
        currency: "eur",
        payment_method_types: ["card"],
        metadata: {
          donorNickname: validatedData.donorNickname,
          userId: req.user.id.toString()
        }
      });

      await storage.createDonation({
        userId: req.user.id,
        amount: validatedData.amount,
        donorNickname: validatedData.donorNickname
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get top donation
  app.get("/api/donations/top", async (req, res) => {
    try {
      const topDonation = await storage.getTopDonation();
      res.json(topDonation);
    } catch (error: any) {
      console.error("Error fetching top donation:", error);
      res.status(500).json({ message: error.message });
    }
  });

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

  // Nouvelle route pour mettre à jour un personnage
  app.patch("/api/characters/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const characterId = parseInt(req.params.id);
    const validatedData = insertCharacterSchema.parse(req.body);

    // Vérifier si le personnage existe et appartient à l'utilisateur
    const character = await storage.getCharacter(characterId);
    if (!character) return res.status(404).send("Character not found");

    if (character.userId !== req.user.id && !req.user.isGameMaster) {
      return res.status(403).send("Not authorized");
    }

    const updatedCharacter = await storage.updateCharacter(characterId, validatedData);
    res.json(updatedCharacter);
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