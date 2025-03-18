import { IStorage } from "./types";
import type { User, InsertUser, Character, GameRoom } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private gameRooms: Map<number, GameRoom>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.gameRooms = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, isGameMaster: false };
    this.users.set(id, user);
    return user;
  }

  async createCharacter(character: Omit<Character, "id">): Promise<Character> {
    const id = this.currentId++;
    const newCharacter = { ...character, id };
    this.characters.set(id, newCharacter);
    return newCharacter;
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(
      (char) => char.userId === userId,
    );
  }

  async createGameRoom(room: Omit<GameRoom, "id">): Promise<GameRoom> {
    const id = this.currentId++;
    const newRoom = { ...room, id };
    this.gameRooms.set(id, newRoom);
    return newRoom;
  }

  async getGameRooms(): Promise<GameRoom[]> {
    return Array.from(this.gameRooms.values());
  }
}

export const storage = new MemStorage();
