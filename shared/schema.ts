import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Scores table
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  gameId: text("game_id").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertScoreSchema = createInsertSchema(scores).pick({
  userId: true,
  gameId: true,
  score: true,
});

export type InsertScore = z.infer<typeof insertScoreSchema>;
export type Score = typeof scores.$inferSelect;

// Game progress table
export const gameProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  gameId: text("game_id").notNull(),
  level: integer("level").notNull().default(1),
  gamesCompleted: integer("games_completed").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGameProgressSchema = createInsertSchema(gameProgress).pick({
  userId: true,
  gameId: true,
  level: true,
  gamesCompleted: true,
  isUnlocked: true,
});

export type InsertGameProgress = z.infer<typeof insertGameProgressSchema>;
export type GameProgress = typeof gameProgress.$inferSelect;
