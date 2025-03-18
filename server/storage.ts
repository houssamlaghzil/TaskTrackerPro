import { IStorage } from "./types";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { users, characters, gameRooms } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { User, InsertUser, Character, GameRoom } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }

    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createCharacter(character: Omit<Character, "id">): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async getCharactersByRoomId(roomId: number): Promise<Character[]> {
    return await db
      .select()
      .from(characters)
      .where(eq(characters.roomId, roomId));
  }

  async getCharactersByUserAndRoom(userId: number, roomId: number): Promise<Character[]> {
    return await db
      .select()
      .from(characters)
      .where(
        and(
          eq(characters.userId, userId),
          eq(characters.roomId, roomId)
        )
      );
  }

  async createGameRoom(room: Omit<GameRoom, "id">): Promise<GameRoom> {
    const [newRoom] = await db
      .insert(gameRooms)
      .values(room)
      .returning();
    return newRoom;
  }

  async getGameRooms(): Promise<GameRoom[]> {
    return await db.select().from(gameRooms);
  }

  async getGameRoom(id: number): Promise<GameRoom | undefined> {
    const [room] = await db
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, id));
    return room;
  }
}

export const storage = new DatabaseStorage();