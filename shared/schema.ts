import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isGameMaster: boolean("is_game_master").default(false).notNull(),
});

export const gameRooms = pgTable("game_rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  gameMasterId: integer("game_master_id").references(() => users.id).notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  roomId: integer("room_id").references(() => gameRooms.id).notNull(),
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
  // Nouveaux champs
  mana: integer("mana").default(0),
  maxMana: integer("max_mana").default(0),
  stamina: integer("stamina").default(0),
  maxStamina: integer("max_stamina").default(0),
  ultimateAttack: jsonb("ultimate_attack").$type<{
    name: string;
    description: string;
    damage: string;
    cooldown: string;
    isAvailable: boolean;
  }>(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  userId: true,
  roomId: true,
}).extend({
  mana: z.number().optional(),
  maxMana: z.number().optional(),
  stamina: z.number().optional(),
  maxStamina: z.number().optional(),
  ultimateAttack: z.object({
    name: z.string(),
    description: z.string(),
    damage: z.string(),
    cooldown: z.string(),
    isAvailable: z.boolean()
  }).optional(),
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).omit({
  id: true,
  gameMasterId: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  characterId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type GameRoom = typeof gameRooms.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;