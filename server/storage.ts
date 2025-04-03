import { favorites, type Favorite, type InsertFavorite, users, type User, type InsertUser } from "@shared/schema";
import { db } from './db';
import { eq, and } from 'drizzle-orm';

// CRUD methods interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Favorites methods
  getFavorites(userId: number): Promise<Favorite[]>;
  getFavorite(id: number): Promise<Favorite | undefined>;
  getFavoriteByPlaceId(userId: number, placeId: string): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  deleteFavoriteByPlaceId(userId: number, placeId: string): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private favorites: Map<number, Favorite>;
  userCurrentId: number;
  favoriteCurrentId: number;

  constructor() {
    this.users = new Map();
    this.favorites = new Map();
    this.userCurrentId = 1;
    this.favoriteCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Favorites methods
  async getFavorites(userId: number): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (favorite) => favorite.userId === userId,
    );
  }

  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favorites.get(id);
  }

  async getFavoriteByPlaceId(userId: number, placeId: string): Promise<Favorite | undefined> {
    return Array.from(this.favorites.values()).find(
      (favorite) => favorite.userId === userId && favorite.placeId === placeId,
    );
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = this.favoriteCurrentId++;
    const favorite: Favorite = { ...insertFavorite, id };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    return this.favorites.delete(id);
  }

  async deleteFavoriteByPlaceId(userId: number, placeId: string): Promise<boolean> {
    const favorite = await this.getFavoriteByPlaceId(userId, placeId);
    if (!favorite) return false;
    return this.favorites.delete(favorite.id);
  }
}

// PostgreSQL storage implementation
export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Favorites methods
  async getFavorites(userId: number): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async getFavorite(id: number): Promise<Favorite | undefined> {
    const result = await db.select().from(favorites).where(eq(favorites.id, id)).limit(1);
    return result[0];
  }

  async getFavoriteByPlaceId(userId: number, placeId: string): Promise<Favorite | undefined> {
    const result = await db.select().from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.placeId, placeId)
      ))
      .limit(1);
    return result[0];
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const result = await db.insert(favorites).values(insertFavorite).returning();
    return result[0];
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const result = await db.delete(favorites).where(eq(favorites.id, id)).returning({ id: favorites.id });
    return result.length > 0;
  }

  async deleteFavoriteByPlaceId(userId: number, placeId: string): Promise<boolean> {
    const result = await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.placeId, placeId)
      ))
      .returning({ id: favorites.id });
    return result.length > 0;
  }
}

// Use PostgreSQL storage
export const storage = new PostgresStorage();
