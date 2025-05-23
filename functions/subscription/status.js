import { createSupabaseAdminClient } from '../lib/supabase.js';

export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };


  // Handle preflight requests
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Only allow GET requests
  if (context.request.method !== 'GET') {
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
    
    if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is "No rows returned"
      console.error('Error getting customer:', customerError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error getting customer information' }),
        { status: 500, headers }
      );
    }
    
    // If no customer record is found
    if (!customer) {
      return new Response(
        JSON.stringify({ success: true, subscription: null }),
        { status: 200, headers }
      );
    }
    
    // Get active subscriptions
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customer.customer_id)
      .in('subscription_status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error getting subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error getting subscription information' }),
        { status: 500, headers }
      );
    }
    
    // Return subscription information
    return new Response(
      JSON.stringify({ success: true, subscription: subscription || null }),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('Error processing subscription status request:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { status: 500, headers }
    );
  }
} 