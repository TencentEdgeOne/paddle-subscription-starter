import { callPaddleApi } from '../../lib/paddle-utils.js';
import { createSupabaseClient } from '../../lib/supabase.js';

export async function POST(request) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };


  try {
    // Get the authorization token from the request
    const accessToken = request.headers.get('Authorization');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers }
      );
    }    
    // Initialize Supabase client
    const supabase = createSupabaseClient();
    
    // Verify user token and get user information
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
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
      await callPaddleApi(`/subscriptions/${subscription.subscription_id}`, 'PATCH', { scheduled_change: null});
      // cancel the scheduled subscription
      const paddleResponse = await callPaddleApi(`/subscriptions/${subscription.subscription_id}/cancel`, 'POST', {
        effective_from: 'immediately'
      });
      
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