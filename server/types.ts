import type { User, InsertUser, Character, GameRoom } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createCharacter(character: Omit<Character, "id">): Promise<Character>;
  getCharactersByUserId(userId: number): Promise<Character[]>;
  createGameRoom(room: Omit<GameRoom, "id">): Promise<GameRoom>;
  getGameRooms(): Promise<GameRoom[]>;
  sessionStore: Store;
}
