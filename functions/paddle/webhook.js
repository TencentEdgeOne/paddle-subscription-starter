import { createSupabaseAdminClient } from '../lib/supabase.js';
import { validateWebhookSignature, handleCustomerCreation, handleSubscriptionChange } from '../lib/paddle-utils.js';

// Webhook handler function
export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { status: 405, headers }
    );
  }

  try {
    // 1. Get raw request body - important: don't process the request body
    const rawBody = await context.request.text();
    let payload;
    
    try {
      // Parse JSON payload
      payload = JSON.parse(rawBody);
      console.log('Received Paddle webhook:', JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to parse webhook payload:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid JSON payload' }),
        { status: 400, headers }
      );
    }

    // 2. Get Paddle-Signature header
    const signatureHeader = context.request.headers.get('Paddle-Signature');
    const webhookSecret = context.env.PADDLE_WEBHOOK_SECRET;
    
    // 3. Verify signature
    if (webhookSecret && signatureHeader) {
      // Since validateWebhookSignature function needs the original JSON string, we need to convert payload back to string
      const { isValid, message } = await validateWebhookSignature(payload, signatureHeader, webhookSecret);
      
      if (!isValid) {
        console.warn('Signature verification failed');
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid signature:' + message }),
          { status: 401, headers }
        );
      }
      
      console.log('Signature verification successful');
    } else {
      // Only allow unverified webhooks in development environment
      if (context.env.NEXT_PUBLIC_DEV !== 'true') {
        console.warn('Missing webhook secret or signature in production environment');
        return new Response(
          JSON.stringify({ success: false, message: 'Request missing required verification information' }),
          { status: 401, headers }
        );
      }
      console.warn('Development mode: Skipping webhook signature verification');
    }

    // Initialize Supabase client
    const supabase = createSupabaseAdminClient(context);

    // Process different events based on event type
    const eventType = payload.event_type;
    const eventData = payload.data;
    
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionChange(supabase, eventData);
        break;
        
      case 'subscription.canceled':
        // Update subscription status to canceled
        await supabase
          .from('subscriptions')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', eventData.id);
        break;
        
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerCreation(supabase, eventData);
        break;
        
      default:
        // Log but don't process other event types
        console.log(`Ignoring event ${eventType}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
} 