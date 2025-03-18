import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isGameMaster: boolean("is_game_master").default(false).notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  race: text("race").notNull(),
  class: text("class").notNull(),
  level: integer("level").default(1).notNull(),
  stats: jsonb("stats").notNull().$type<{
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  }>(),
  hitPoints: integer("hit_points").notNull(),
  maxHitPoints: integer("max_hit_points").notNull(),
});

export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameMasterId: integer("game_master_id").references(() => users.id).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  userId: true,
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type GameRoom = typeof gameRooms.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;