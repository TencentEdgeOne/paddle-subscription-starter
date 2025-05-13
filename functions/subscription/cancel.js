import { callPaddleApi } from '../lib/paddle-utils.js';
import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

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
    // Get the authorization token from the request
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Initialize Supabase client
    const supabase = createSupabaseAdminClient(context);
    
    // Verify user token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid access token' }),
        { status: 401, headers }
      );
    }
    
    // Get the customer ID associated with the user
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', user.email)
      .single();
    
    if (customerError) {
      console.error('Error getting customer:', customerError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error getting customer information' }),
        { status: 500, headers }
      );
    }
    
    if (!customer) {
      return new Response(
        JSON.stringify({ success: false, message: 'Customer record not found' }),
        { status: 404, headers }
      );
    }
    
    // Get the user's active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .in('subscription_status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    console.log('Subscription to be deleted', subscription);
    if (subscriptionError) {
      console.error('Error getting subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error getting subscription information' }),
        { status: 500, headers }
      );
    }
    
    if (!subscription) {
      return new Response(
        JSON.stringify({ success: false, message: 'Active subscription not found' }),
        { status: 404, headers }
      );
    }
    

    try {
      // cancel the scheduled subscription first
      await callPaddleApi(context, `/subscriptions/${subscription.subscription_id}`, 'PATCH', { scheduled_change: null});
      // cancel the scheduled subscription
      const paddleResponse = await callPaddleApi(context, `/subscriptions/${subscription.subscription_id}/cancel`, 'POST', {
        effective_from: 'immediately'
      });
      
      console.log('paddleResponse', paddleResponse);
      if (!paddleResponse.ok) {
        throw new Error('Failed to cancel Paddle subscription');
      }
      
    
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription successfully cancelled'
        }),
        { status: 200, headers }
      );
    } catch (paddleError) {
      console.error('Paddle API error:', paddleError);
      return new Response(
        JSON.stringify({ success: false, message: paddleError.message || 'Error cancelling subscription' }),
        { status: 500, headers }
      );
    }
  } catch (error) {
    console.error('Error processing cancel subscription request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
} 