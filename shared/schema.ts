import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email").unique(),
  displayName: text("display_name"),
  // Email verification
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationTokenExpires: timestamp("verification_token_expires"),
  // Reset password
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_token_expires"),
  // OAuth fields
  providerId: text("provider_id"),  // 'google', 'github', etc.
  providerUserId: text("provider_user_id"), // ID from the provider
  // Subscription fields
  customerId: text("customer_id"),  // Stripe customer ID
  subscriptionId: text("subscription_id"),  // Stripe subscription ID
  subscriptionStatus: text("subscription_status"),  // active, canceled, trialing
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  subscriptionTier: text("subscription_tier").default("free"),  // free, premium
  // Profile image
  avatar: text("avatar"),
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

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  priceId: text("price_id"),  // Stripe price ID
  active: boolean("active").default(true),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(),
  sessionId: text("session_id"),  // Stripe checkout session ID
  paymentIntentId: text("payment_intent_id"),  // Stripe payment intent ID
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  emailVerified: true,
  verificationToken: true,
  verificationTokenExpires: true,
  resetPasswordToken: true,
  resetPasswordExpires: true,
  providerId: true,
  providerUserId: true,
  customerId: true,
  subscriptionId: true,
  subscriptionStatus: true,
  trialStartDate: true,
  trialEndDate: true,
  subscriptionTier: true,
  avatar: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).pick({
  userId: true,
  placeId: true,
  name: true,
  address: true,
  phoneNumber: true,
  location: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  price: true,
  priceId: true,
  active: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  serviceId: true,
  amount: true,
  status: true,
  sessionId: true,
  paymentIntentId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

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

// Stripe and checkout related types
export const checkoutSessionSchema = z.object({
  serviceId: z.number(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;

export const stripeProductSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()).optional(),
  metadata: z.record(z.string()).optional(),
});

export type StripeProduct = z.infer<typeof stripeProductSchema>;

export const stripePriceSchema = z.object({
  id: z.string().optional(),
  currency: z.string().default("usd"),
  unit_amount: z.number(),
  product: z.string().or(stripeProductSchema),
});

export type StripePrice = z.infer<typeof stripePriceSchema>;

export const paymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  status: z.string(),
  client_secret: z.string().optional(),
});

export type PaymentIntent = z.infer<typeof paymentIntentSchema>;

// Subscription-related types
export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priceId: z.string(),  // Stripe price ID for this plan
  price: z.number(),    // Price in cents
  interval: z.enum(['month', 'year']),
  features: z.array(z.string()),
  isFree: z.boolean().default(false),
  trialDays: z.number().default(0),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

export const subscriptionRequestSchema = z.object({
  planId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type SubscriptionRequest = z.infer<typeof subscriptionRequestSchema>;

export const subscriptionStatusSchema = z.object({
  subscriptionId: z.string().optional(),
  customerId: z.string().optional(),
  status: z.enum(['active', 'canceled', 'trialing', 'past_due', 'unpaid', 'incomplete']).optional(),
  currentPeriodEnd: z.number().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  trialEnd: z.number().optional(),
});

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
