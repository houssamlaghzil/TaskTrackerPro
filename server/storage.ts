import { IStorage } from "./types";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { db } from "./db";
import { users, characters, gameRooms, items, donations } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import type { User, InsertUser, Character, GameRoom, Item, InsertCharacter, Donation } from "@shared/schema";

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

  async deleteCharacter(id: number): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
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

  async createItem(item: Omit<Item, "id">): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async getItemsByCharacterId(characterId: number): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(eq(items.characterId, characterId));
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id));
    return character;
  }

  async updateCharacter(id: number, character: Partial<InsertCharacter>): Promise<Character> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(character)
      .where(eq(characters.id, id))
      .returning();
    return updatedCharacter;
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return await db
      .select()
      .from(characters)
      .where(eq(characters.userId, userId));
  }

  async createDonation(donation: {
    userId: number;
    amount: number;
    donorNickname: string;
  }): Promise<Donation> {
    const [newDonation] = await db
      .insert(donations)
      .values(donation)
      .returning();
    return newDonation;
  }

  async getTopDonation(): Promise<Donation | undefined> {
    const [topDonation] = await db
      .select()
      .from(donations)
      .orderBy(desc(donations.amount))
      .limit(1);
    return topDonation;
  }
}

export const storage = new DatabaseStorage();