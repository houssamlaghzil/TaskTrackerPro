import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
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
  description: text("description"),
  setting: text("setting"),
  status: text("status").default("active").notNull(),
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
  type: text("type").notNull(),
  properties: jsonb("properties").$type<{
    damage?: string;
    armor?: number;
    effect?: string;
    duration?: number;
  }>(),
});

export const spells = pgTable("spells", {
  id: serial("id").primaryKey(),
  characterId: integer("character_id").references(() => characters.id).notNull(),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  school: text("school").notNull(),
  castingTime: text("casting_time").notNull(),
  range: text("range").notNull(),
  duration: text("duration").notNull(),
  description: text("description").notNull(),
  manaCost: integer("mana_cost").notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => gameRooms.id).notNull(),
  name: text("name").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  summary: text("summary"),
  status: text("status").default("scheduled").notNull(),
});

export const combatEncounters = pgTable("combat_encounters", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => gameSessions.id).notNull(),
  name: text("name").notNull(),
  status: text("status").default("pending").notNull(),
  initiative: jsonb("initiative").$type<{
    characterId: number;
    initiative: number;
    isActive: boolean;
  }[]>(),
  enemies: jsonb("enemies").$type<{
    name: string;
    hitPoints: number;
    maxHitPoints: number;
    stats: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
  }[]>(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").references(() => gameRooms.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  characterId: integer("character_id").references(() => characters.id),
  content: text("content").notNull(),
  type: text("type").default("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  userId: true,
  roomId: true,
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).omit({
  id: true,
  gameMasterId: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  characterId: true,
});

export const insertSpellSchema = createInsertSchema(spells).omit({
  id: true,
  characterId: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
  roomId: true,
});

export const insertCombatEncounterSchema = createInsertSchema(combatEncounters).omit({
  id: true,
  sessionId: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  roomId: true,
  userId: true,
  characterId: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type GameRoom = typeof gameRooms.$inferSelect;
export type Item = typeof items.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Spell = typeof spells.$inferSelect;
export type InsertSpell = z.infer<typeof insertSpellSchema>;
export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type CombatEncounter = typeof combatEncounters.$inferSelect;
export type InsertCombatEncounter = z.infer<typeof insertCombatEncounterSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;