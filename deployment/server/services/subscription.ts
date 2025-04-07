import Stripe from 'stripe';
import { storage } from '../storage';
import { 
  SubscriptionPlan, 
  SubscriptionStatus,
  SubscriptionRequest
} from '@shared/schema';

// Initialize Stripe with the API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil'
});

// Default premium subscription price in cents ($9.99 per month)
const PREMIUM_PRICE = 999;

// Default trial period in days (24 hours)
const TRIAL_DAYS = 1;

/**
 * Available subscription plans
 */
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic access with limited features',
    priceId: '',
    price: 0,
    interval: 'month',
    features: [
      'Limited search functionality',
      'Basic location services',
      'Standard map view'
    ],
    isFree: true,
    trialDays: 0
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Full access to all features',
    priceId: '',
    price: PREMIUM_PRICE,
    interval: 'month',
    features: [
      'Unlimited searches',
      'Advanced location tracking',
      'AI-powered search enhancements',
      'Premium support',
      'No ads'
    ],
    isFree: false,
    trialDays: TRIAL_DAYS
  }
];

/**
 * Create premium product and price in Stripe if they don't exist
 */
export async function initializeSubscriptionProducts(): Promise<void> {
  try {
    if (!isStripeConfigured()) {
      console.log('Stripe not configured. Skipping subscription product initialization.');
      return;
    }

    // Get or create premium product
    const premiumPlan = subscriptionPlans.find(plan => plan.id === 'premium');
    if (!premiumPlan) {
      throw new Error('Premium plan not found in subscription plans');
    }

    // List existing products to find our premium product
    const products = await stripe.products.list({
      limit: 100
    });
    
    let premiumProduct = products.data.find(
      product => product.name === premiumPlan.name
    );

    // Create product if it doesn't exist
    if (!premiumProduct) {
      premiumProduct = await stripe.products.create({
        name: premiumPlan.name,
        description: premiumPlan.description,
        metadata: {
          plan_id: premiumPlan.id
        }
      });
      console.log(`Created premium product with ID: ${premiumProduct.id}`);
    }

    // Look for existing price
    const prices = await stripe.prices.list({
      product: premiumProduct.id,
      limit: 100
    });

    let premiumPrice = prices.data.find(
      price => price.unit_amount === premiumPlan.price && price.recurring?.interval === premiumPlan.interval
    );

    // Create price if it doesn't exist
    if (!premiumPrice) {
      premiumPrice = await stripe.prices.create({
        product: premiumProduct.id,
        unit_amount: premiumPlan.price,
        currency: 'usd',
        recurring: {
          interval: premiumPlan.interval
        },
        metadata: {
          plan_id: premiumPlan.id
        }
      });
      console.log(`Created premium price with ID: ${premiumPrice.id}`);
    }

    // Update the plan with the price ID
    premiumPlan.priceId = premiumPrice.id;
    
  } catch (error: any) {
    console.error('Error initializing subscription products:', error);
  }
}

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionCheckout(
  userId: number,
  planId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ id: string; url: string }> {
  try {
    // Get the plan
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    // Don't allow checkout for free plan
    if (plan.isFree) {
      throw new Error('Cannot checkout with free plan');
    }

    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Create or retrieve Stripe customer
    let customerId = user.customerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await storage.updateUserCustomerId(userId, customerId);
    }

    // Ensure product and price exist
    if (!plan.priceId) {
      await initializeSubscriptionProducts();
      
      // Refresh plan after initialization
      const updatedPlan = subscriptionPlans.find(p => p.id === planId);
      if (!updatedPlan || !updatedPlan.priceId) {
        throw new Error('Failed to create subscription price in Stripe');
      }
      
      plan.priceId = updatedPlan.priceId;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        planId: plan.id
      },
      subscription_data: {
        trial_period_days: plan.trialDays
      }
    });

    return {
      id: session.id,
      url: session.url as string
    };
  } catch (error: any) {
    console.error('Error creating subscription checkout:', error);
    throw new Error(`Failed to create subscription checkout: ${error.message}`);
  }
}

/**
 * Start a free trial for the user
 */
export async function startTrial(userId: number): Promise<{ success: boolean; message: string }> {
  try {
    // Get the premium plan
    const premiumPlan = subscriptionPlans.find(plan => plan.id === 'premium');
    if (!premiumPlan) {
      throw new Error('Premium plan not found in subscription plans');
    }

    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Check if user already has a trial or subscription
    const { isTrialActive, isSubscriptionActive } = await storage.getUserSubscriptionStatus(userId);
    
    if (isTrialActive || isSubscriptionActive) {
      return { 
        success: false, 
        message: 'User already has an active trial or subscription' 
      };
    }

    // Calculate trial start and end dates
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + premiumPlan.trialDays);

    // Set trial period for the user
    await storage.setTrialPeriod(userId, now, trialEndDate);

    return { 
      success: true, 
      message: `Trial started successfully. Expires on ${trialEndDate.toISOString()}` 
    };
  } catch (error: any) {
    console.error('Error starting trial:', error);
    return { 
      success: false, 
      message: `Failed to start trial: ${error.message}` 
    };
  }
}

/**
 * Handle Stripe subscription webhook events
 */
export async function handleSubscriptionWebhook(
  event: Stripe.Event
): Promise<{ status: string; message: string }> {
  try {
    switch (event.type) {
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find the user by customer ID
        const users = await db.select().from(dbUsers).where(eq(dbUsers.customerId, customerId));
        if (users.length === 0) {
          return { status: 'error', message: `User with customer ID ${customerId} not found` };
        }
        
        const userId = users[0].id;
        
        // Update user subscription details
        await storage.updateUserSubscription(
          userId,
          subscription.id,
          subscription.status,
          'premium'
        );
        
        return { status: 'success', message: 'Subscription created successfully' };
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find the user by customer ID
        const users = await db.select().from(dbUsers).where(eq(dbUsers.customerId, customerId));
        if (users.length === 0) {
          return { status: 'error', message: `User with customer ID ${customerId} not found` };
        }
        
        const userId = users[0].id;
        
        // Update user subscription details
        await storage.updateUserSubscription(
          userId,
          subscription.id,
          subscription.status,
          'premium'
        );
        
        return { status: 'success', message: 'Subscription updated successfully' };
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Find the user by customer ID
        const users = await db.select().from(dbUsers).where(eq(dbUsers.customerId, customerId));
        if (users.length === 0) {
          return { status: 'error', message: `User with customer ID ${customerId} not found` };
        }
        
        const userId = users[0].id;
        
        // Update user subscription details
        await storage.updateUserSubscription(
          userId,
          subscription.id,
          'canceled',
          'free'
        );
        
        return { status: 'success', message: 'Subscription deleted successfully' };
      }
      
      default:
        return { status: 'ignored', message: `Event type ${event.type} not handled` };
    }
  } catch (error: any) {
    console.error('Error handling subscription webhook:', error);
    return { status: 'error', message: `Error handling subscription webhook: ${error.message}` };
  }
}

/**
 * Get user subscription status
 */
export async function getUserSubscriptionStatus(
  userId: number
): Promise<SubscriptionStatus> {
  try {
    const status = await storage.getUserSubscriptionStatus(userId);
    
    return {
      subscriptionId: undefined, // We don't store subscription ID in our DB schema
      customerId: undefined, // Don't expose customer ID
      status: status.subscriptionStatus as any,
      currentPeriodEnd: undefined, // We don't track this in our DB
      cancelAtPeriodEnd: undefined, // We don't track this in our DB
      trialEnd: status.trialEndDate ? status.trialEndDate.getTime() : undefined
    };
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    throw new Error(`Failed to get subscription status: ${error.message}`);
  }
}

/**
 * Check if user has active premium access
 */
export async function hasActivePremium(userId: number): Promise<boolean> {
  try {
    const { isSubscriptionActive } = await storage.getUserSubscriptionStatus(userId);
    return isSubscriptionActive;
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Check if Stripe API is configured and available
 */
export function isStripeConfigured(): boolean {
  return stripeSecretKey !== 'sk_test_placeholder';
}

// Import modules for database operations
import { db } from '../db';
import { users as dbUsers } from '@shared/schema';
import { eq } from 'drizzle-orm';