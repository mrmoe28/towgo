import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  placeId: text("place_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phoneNumber: text("phone_number"),
  location: jsonb("location").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  placeId: true,
  name: true,
  address: true,
  phoneNumber: true,
  location: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Business types for the app
export const businessSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  category: z.string().optional(),
  address: z.string(),
  phoneNumber: z.string().optional(),
  website: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  distance: z.number().optional(),
});

export type Business = z.infer<typeof businessSchema>;

// Search params type
export const searchParamsSchema = z.object({
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z.number().min(1).max(50000), // Allow up to 31 miles (50000 meters)
  businessType: z.string().optional(),
  sortBy: z.enum(["distance", "relevance", "category"]).default("distance"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Perplexity result info
export const perplexityCitationSchema = z.object({
  url: z.string(),
  text: z.string().optional(),
  title: z.string().optional(),
});

export type PerplexityCitation = z.infer<typeof perplexityCitationSchema>;

export const perplexityResultSchema = z.object({
  originalQuery: z.string().optional(),
  enhancedQuery: z.string().optional(),
  isEnhanced: z.boolean().default(false),
  citations: z.array(perplexityCitationSchema).optional(),
});

export type PerplexityResult = z.infer<typeof perplexityResultSchema>;

// Web Search Types
export const scrapedBusinessSchema = z.object({
  title: z.string(),
  url: z.string(),
  description: z.string(),
  phone: z.string().optional(),
  address: z.string().optional(),
  rating: z.string().optional(),
  hours: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  website: z.string().optional(),
  source: z.string(),
  sourceType: z.enum(['search', 'directory', 'social'])
});

export const webSearchResultSchema = z.object({
  originalQuery: z.string(),
  businesses: z.array(scrapedBusinessSchema),
  totalResults: z.number(),
  timeTaken: z.string(),
  sources: z.array(z.string())
});

export type ScrapedBusiness = z.infer<typeof scrapedBusinessSchema>;
export type WebSearchResult = z.infer<typeof webSearchResultSchema>;
