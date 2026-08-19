import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stylesTable = pgTable("styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("cuts"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStyleSchema = createInsertSchema(stylesTable).omit({ id: true, createdAt: true });
export type InsertStyle = z.infer<typeof insertStyleSchema>;
export type Style = typeof stylesTable.$inferSelect;
