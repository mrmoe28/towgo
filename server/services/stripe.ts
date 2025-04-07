import Stripe from 'stripe';
import { z } from 'zod';
import { 
  CheckoutSession, 
  StripeProduct, 
  StripePrice, 
  PaymentIntent
} from '@shared/schema';
import { storage } from '../storage';

// Initialize Stripe with the API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-03-31.basil'
});

/**
 * Create a Stripe checkout session
 * 
 * @param userId User ID for whom to create the checkout
 * @param serviceId Service ID to purchase
 * @param successUrl Success URL to redirect after successful payment
 * @param cancelUrl Cancel URL to redirect after cancelled payment
 * @returns Checkout session details including the URL to redirect the user
 */
export async function createCheckoutSession(
  userId: number,
  serviceId: number,
  successUrl: string,
  cancelUrl: string
): Promise<{ id: string; url: string }> {
  try {
    // Get the service details
    const service = await storage.getService(serviceId);
    if (!service) {
      throw new Error(`Service with ID ${serviceId} not found`);
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

    // Create or retrieve product in Stripe
    let productId = '';
    if (service.priceId) {
      // If we have a price ID, we can get the product ID from it
      const price = await stripe.prices.retrieve(service.priceId);
      productId = typeof price.product === 'string' ? price.product : price.product.id;
    } else {
      // Create a new product
      const product = await stripe.products.create({
        name: service.name,
        description: service.description,
        metadata: {
          serviceId: serviceId.toString()
        }
      });
      productId = product.id;
    }

    // Create or retrieve price in Stripe
    let priceId = service.priceId;
    if (!priceId) {
      // Create a new price
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(parseFloat(service.price.toString()) * 100), // Convert to cents
        currency: 'usd'
      });
      priceId = price.id;

      // Update service with price ID
      await storage.updateService(serviceId, { priceId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        serviceId: serviceId.toString()
      }
    });

    // Store payment information
    await storage.createPayment({
      userId,
      serviceId,
      amount: service.price.toString(),
      status: 'pending',
      sessionId: session.id,
      paymentIntentId: session.payment_intent as string
    });

    return {
      id: session.id,
      url: session.url as string
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
}

/**
 * Handle Stripe webhook events
 * 
 * @param event Stripe event object
 * @returns Processing result
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<{ status: string; message: string }> {
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Find the payment by session ID
        const payment = await storage.getPaymentBySessionId(session.id);
        if (!payment) {
          return { status: 'error', message: `Payment with session ID ${session.id} not found` };
        }
        
        // Update payment status
        await storage.updatePaymentStatus(payment.id, 'completed');
        
        return { status: 'success', message: 'Payment completed successfully' };
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find the payment by payment intent ID
        const payment = await storage.getPaymentBySessionId(paymentIntent.id);
        if (!payment) {
          return { status: 'error', message: `Payment with payment intent ID ${paymentIntent.id} not found` };
        }
        
        // Update payment status
        await storage.updatePaymentStatus(payment.id, 'succeeded');
        
        return { status: 'success', message: 'Payment intent succeeded' };
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Find the payment by payment intent ID
        const payment = await storage.getPaymentBySessionId(paymentIntent.id);
        if (!payment) {
          return { status: 'error', message: `Payment with payment intent ID ${paymentIntent.id} not found` };
        }
        
        // Update payment status
        await storage.updatePaymentStatus(payment.id, 'failed');
        
        return { status: 'success', message: 'Payment intent failed' };
      }
      
      default:
        return { status: 'ignored', message: `Event type ${event.type} not handled` };
    }
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return { status: 'error', message: `Error handling webhook: ${error.message}` };
  }
}

/**
 * Retrieve payment status
 * 
 * @param sessionId Checkout session ID
 * @returns Payment status
 */
export async function getPaymentStatus(sessionId: string): Promise<{ status: string }> {
  try {
    const payment = await storage.getPaymentBySessionId(sessionId);
    if (!payment) {
      throw new Error(`Payment with session ID ${sessionId} not found`);
    }
    
    return { status: payment.status };
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw new Error(`Failed to get payment status: ${error.message}`);
  }
}

/**
 * Check if Stripe API is configured and available
 * 
 * @returns Boolean indicating if Stripe is available
 */
export function isStripeConfigured(): boolean {
  return stripeSecretKey !== 'sk_test_placeholder';
}