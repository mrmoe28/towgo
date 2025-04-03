import crypto from 'crypto';
import { z } from 'zod';

// Define the schema for location sharing
export const locationSharingSchema = z.object({
  address: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  accuracy: z.enum(['exact', 'approximate', 'city']),
  expires: z.string().datetime(),
  includeVehicleInfo: z.boolean().default(false),
  vehicleInfo: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.string().optional(),
    color: z.string().optional(),
    type: z.string().optional(),
    licensePlate: z.string().optional(),
  }).optional(),
});

// Get a type from the schema
export type LocationSharingData = z.infer<typeof locationSharingSchema>;

// In-memory storage for location shares (in a real app, this would be in a database)
// Key is the share ID, value is the location sharing data
const locationShares = new Map<string, LocationSharingData>();

/**
 * Create a new location share
 * @param shareData Location data to share
 * @returns ID of the created share
 */
export function createLocationShare(shareData: LocationSharingData): string {
  // Validate data against schema
  locationSharingSchema.parse(shareData);
  
  // Generate a unique ID for this share
  const shareId = crypto.randomUUID();
  
  // Store the share data
  locationShares.set(shareId, shareData);
  
  // Set up automatic cleanup when share expires
  const expiresAt = new Date(shareData.expires).getTime();
  const now = Date.now();
  const timeoutMs = Math.max(0, expiresAt - now);
  
  // Set a timeout to clean up this share when it expires
  setTimeout(() => {
    locationShares.delete(shareId);
    console.log(`Location share ${shareId} expired and was removed`);
  }, timeoutMs);
  
  return shareId;
}

/**
 * Get a location share by ID
 * @param shareId ID of the share to retrieve
 * @returns Location share data or null if not found or expired
 */
export function getLocationShare(shareId: string): LocationSharingData | null {
  const shareData = locationShares.get(shareId);
  
  // If share doesn't exist, return null
  if (!shareData) {
    return null;
  }
  
  // Check if share has expired
  const expiresAt = new Date(shareData.expires).getTime();
  const now = Date.now();
  
  if (now > expiresAt) {
    // Share has expired, clean it up
    locationShares.delete(shareId);
    return null;
  }
  
  return shareData;
}

/**
 * Delete a location share by ID
 * @param shareId ID of the share to delete
 * @returns Whether the share was successfully deleted
 */
export function deleteLocationShare(shareId: string): boolean {
  return locationShares.delete(shareId);
}

/**
 * Get all active shares
 * @returns Array of share IDs and their data
 */
export function getAllActiveShares(): Array<{ id: string, data: LocationSharingData }> {
  const now = Date.now();
  const activeShares: Array<{ id: string, data: LocationSharingData }> = [];
  
  // Filter out expired shares
  locationShares.forEach((data, id) => {
    const expiresAt = new Date(data.expires).getTime();
    
    if (now <= expiresAt) {
      activeShares.push({ id, data });
    } else {
      // Clean up expired share
      locationShares.delete(id);
    }
  });
  
  return activeShares;
}

/**
 * Apply privacy settings to location data
 * @param shareData Original location data
 * @param accuracy Privacy accuracy level
 * @returns Location data with privacy settings applied
 */
export function applyPrivacySettings(
  shareData: LocationSharingData, 
  accuracy: 'exact' | 'approximate' | 'city' = 'exact'
): LocationSharingData {
  // Clone the data to avoid modifying the original
  const privatizedData = { ...shareData };
  
  // Apply privacy settings based on accuracy level
  if (accuracy === 'approximate' && privatizedData.location) {
    // Reduce precision for approximate location (roughly within a mile)
    privatizedData.location = {
      lat: Math.round(privatizedData.location.lat * 100) / 100,
      lng: Math.round(privatizedData.location.lng * 100) / 100
    };
  } else if (accuracy === 'city') {
    // Remove exact coordinates for city-level privacy
    privatizedData.location = undefined;
    
    // Only keep city part of the address
    if (privatizedData.address) {
      const addressParts = privatizedData.address.split(',');
      privatizedData.address = addressParts[0].trim();
    }
  }
  
  return privatizedData;
}