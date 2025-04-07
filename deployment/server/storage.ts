import { 
  favorites, type Favorite, type InsertFavorite, 
  users, type User, type InsertUser,
  services, type Service, type InsertService,
  payments, type Payment, type InsertPayment
} from "@shared/schema";
import { db } from './db';
import { eq, and } from 'drizzle-orm';

// CRUD methods interface for storage
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  getUserByResetPasswordToken(token: string): Promise<User | undefined>;
  getUserByProvider(providerId: string, providerUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCustomerId(userId: number, customerId: string): Promise<User>;
  updateUserPassword(userId: number, password: string): Promise<User>;
  updateUserVerificationToken(userId: number, token: string, expires: Date): Promise<User>;
  updateUserResetPasswordToken(userId: number, token: string, expires: Date): Promise<User>;
  verifyUserEmail(userId: number): Promise<User>;
  
  // Subscription methods
  updateUserSubscription(
    userId: number, 
    subscriptionId: string, 
    subscriptionStatus: string, 
    subscriptionTier: string
  ): Promise<User>;
  setTrialPeriod(
    userId: number, 
    trialStartDate: Date, 
    trialEndDate: Date
  ): Promise<User>;
  getUserSubscriptionStatus(userId: number): Promise<{
    subscriptionStatus: string | null;
    subscriptionTier: string | null;
    trialEndDate: Date | null;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
  }>;
  
  // Favorites methods
  getFavorites(userId: number): Promise<Favorite[]>;
  getFavorite(id: number): Promise<Favorite | undefined>;
  getFavoriteByPlaceId(userId: number, placeId: string): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  deleteFavoriteByPlaceId(userId: number, placeId: string): Promise<boolean>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  
  // Payment methods
  getPayments(userId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  getPaymentBySessionId(sessionId: string): Promise<Payment | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private favorites: Map<number, Favorite>;
  private services: Map<number, Service>;
  private payments: Map<number, Payment>;
  userCurrentId: number;
  favoriteCurrentId: number;
  serviceCurrentId: number;
  paymentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.favorites = new Map();
    this.services = new Map();
    this.payments = new Map();
    this.userCurrentId = 1;
    this.favoriteCurrentId = 1;
    this.serviceCurrentId = 1;
    this.paymentCurrentId = 1;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }

  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.resetPasswordToken === token,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByProvider(providerId: string, providerUserId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.providerId === providerId && user.providerUserId === providerUserId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password || null,
      email: insertUser.email || null,
      displayName: insertUser.displayName || null,
      emailVerified: insertUser.emailVerified !== undefined ? insertUser.emailVerified : false,
      verificationToken: insertUser.verificationToken || null,
      verificationTokenExpires: insertUser.verificationTokenExpires || null,
      resetPasswordToken: insertUser.resetPasswordToken || null,
      resetPasswordExpires: insertUser.resetPasswordExpires || null,
      providerId: insertUser.providerId || null,
      providerUserId: insertUser.providerUserId || null,
      customerId: insertUser.customerId || null,
      subscriptionId: insertUser.subscriptionId || null,
      subscriptionStatus: insertUser.subscriptionStatus || null,
      trialStartDate: insertUser.trialStartDate || null,
      trialEndDate: insertUser.trialEndDate || null,
      subscriptionTier: insertUser.subscriptionTier || 'free',
      avatar: insertUser.avatar || null
    };
    
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
    const favorite: Favorite = { 
      ...insertFavorite, 
      id,
      phoneNumber: insertFavorite.phoneNumber || null 
    };
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

  async updateUserCustomerId(userId: number, customerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { ...user, customerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(userId: number, password: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { ...user, password };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserVerificationToken(userId: number, token: string, expires: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { 
      ...user, 
      verificationToken: token,
      verificationTokenExpires: expires
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserResetPasswordToken(userId: number, token: string, expires: Date): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { 
      ...user, 
      resetPasswordToken: token,
      resetPasswordExpires: expires
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async verifyUserEmail(userId: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { 
      ...user, 
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Subscription methods
  async updateUserSubscription(
    userId: number, 
    subscriptionId: string, 
    subscriptionStatus: string, 
    subscriptionTier: string
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { 
      ...user, 
      subscriptionId, 
      subscriptionStatus, 
      subscriptionTier 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async setTrialPeriod(
    userId: number, 
    trialStartDate: Date, 
    trialEndDate: Date
  ): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const updatedUser: User = { 
      ...user, 
      trialStartDate, 
      trialEndDate,
      subscriptionStatus: 'trialing',
      subscriptionTier: 'premium'
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async getUserSubscriptionStatus(userId: number): Promise<{
    subscriptionStatus: string | null;
    subscriptionTier: string | null;
    trialEndDate: Date | null;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
  }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error(`User with ID ${userId} not found`);
    
    const now = new Date();
    const trialEndDate = user.trialEndDate || null;
    const isTrialActive = trialEndDate ? now < trialEndDate : false;
    const isSubscriptionActive = user.subscriptionStatus === 'active' || isTrialActive;
    
    return {
      subscriptionStatus: user.subscriptionStatus || null,
      subscriptionTier: user.subscriptionTier || null,
      trialEndDate,
      isTrialActive,
      isSubscriptionActive
    };
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    const service: Service = { 
      ...insertService, 
      id,
      priceId: insertService.priceId || null,
      active: insertService.active || null
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service> {
    const service = await this.getService(id);
    if (!service) throw new Error(`Service with ID ${id} not found`);
    
    const updatedService: Service = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Payment methods
  async getPayments(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.userId === userId
    );
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const now = new Date();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      createdAt: now,
      sessionId: insertPayment.sessionId || null,
      paymentIntentId: insertPayment.paymentIntentId || null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) throw new Error(`Payment with ID ${id} not found`);
    
    const updatedPayment: Payment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getPaymentBySessionId(sessionId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.sessionId === sessionId
    );
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.verificationToken, token)).limit(1);
    return result[0];
  }

  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.resetPasswordToken, token)).limit(1);
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUserByProvider(providerId: string, providerUserId: string): Promise<User | undefined> {
    const result = await db.select().from(users)
      .where(and(
        eq(users.providerId, providerId),
        eq(users.providerUserId, providerUserId)
      ))
      .limit(1);
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

  async updateUserCustomerId(userId: number, customerId: string): Promise<User> {
    const result = await db.update(users)
      .set({ customerId })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  async updateUserPassword(userId: number, password: string): Promise<User> {
    const result = await db.update(users)
      .set({ password })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  async updateUserVerificationToken(userId: number, token: string, expires: Date): Promise<User> {
    const result = await db.update(users)
      .set({ 
        verificationToken: token,
        verificationTokenExpires: expires
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  async updateUserResetPasswordToken(userId: number, token: string, expires: Date): Promise<User> {
    const result = await db.update(users)
      .set({ 
        resetPasswordToken: token,
        resetPasswordExpires: expires
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  async verifyUserEmail(userId: number): Promise<User> {
    const result = await db.update(users)
      .set({ 
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }

  // Subscription methods
  async updateUserSubscription(
    userId: number, 
    subscriptionId: string, 
    subscriptionStatus: string, 
    subscriptionTier: string
  ): Promise<User> {
    const result = await db.update(users)
      .set({ 
        subscriptionId, 
        subscriptionStatus, 
        subscriptionTier 
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }
  
  async setTrialPeriod(
    userId: number, 
    trialStartDate: Date, 
    trialEndDate: Date
  ): Promise<User> {
    const result = await db.update(users)
      .set({ 
        trialStartDate, 
        trialEndDate,
        subscriptionStatus: 'trialing',
        subscriptionTier: 'premium'
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return result[0];
  }
  
  async getUserSubscriptionStatus(userId: number): Promise<{
    subscriptionStatus: string | null;
    subscriptionTier: string | null;
    trialEndDate: Date | null;
    isTrialActive: boolean;
    isSubscriptionActive: boolean;
  }> {
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (result.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const user = result[0];
    const now = new Date();
    const trialEndDate = user.trialEndDate || null;
    const isTrialActive = trialEndDate ? now < trialEndDate : false;
    const isSubscriptionActive = user.subscriptionStatus === 'active' || isTrialActive;
    
    return {
      subscriptionStatus: user.subscriptionStatus || null,
      subscriptionTier: user.subscriptionTier || null,
      trialEndDate,
      isTrialActive,
      isSubscriptionActive
    };
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return result[0];
  }

  async createService(insertService: InsertService): Promise<Service> {
    const result = await db.insert(services).values(insertService).returning();
    return result[0];
  }

  async updateService(id: number, serviceUpdate: Partial<InsertService>): Promise<Service> {
    const result = await db.update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Service with ID ${id} not found`);
    }
    
    return result[0];
  }

  // Payment methods
  async getPayments(userId: number): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.userId, userId));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result[0];
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(insertPayment).returning();
    return result[0];
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const result = await db.update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    return result[0];
  }

  async getPaymentBySessionId(sessionId: string): Promise<Payment | undefined> {
    const result = await db.select().from(payments)
      .where(eq(payments.sessionId, sessionId))
      .limit(1);
    return result[0];
  }
}

// Use PostgreSQL storage
export const storage = new PostgresStorage();
