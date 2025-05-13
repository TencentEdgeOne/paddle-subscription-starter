import { createSupabaseClient } from '../lib/supabase.js';

// Mock subscription database
const subscriptions = [];

export function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.DEV === 'true') {
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

  // Verify authentication
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ success: false, message: 'Unauthorized' }),
      { status: 401, headers }
    );
  }

  const token = authHeader.split(' ')[1];

  return context.request.json()
    .then(async (data) => {
      const { planId } = data;

      if (!planId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Plan ID is required' }),
          { status: 400, headers }
        );
      }

      // Check plan validity
      if (!['basic', 'pro', 'enterprise'].includes(planId)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid plan' }),
          { status: 400, headers }
        );
      }

      try {
        // Initialize Supabase client
        const supabase = createSupabaseClient(context);
        
        // Verify the user's token
        const { data: userData, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !userData.user) {
          return new Response(
            JSON.stringify({ success: false, message: 'Invalid token or user not found' }),
            { status: 401, headers }
          );
        }

        const userId = userData.user.id;

        // Check if the user already has an active subscription
        const existingSubscription = subscriptions.find(
          sub => sub.userId === userId && sub.status === 'active'
        );

        if (existingSubscription) {
          return new Response(
            JSON.stringify({ success: false, message: 'You already have an active subscription' }),
            { status: 409, headers }
          );
        }

        // Create subscription
        const price = planId === 'basic' ? 49 : planId === 'pro' ? 99 : 199;
        const planName = planId === 'basic' ? 'Basic' : planId === 'pro' ? 'Professional' : 'Enterprise';
        
        const subscription = {
          id: `sub_${Date.now()}`,
          userId,
          planId,
          plan: planName,
          status: 'active',
          amount: `$${price}`,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        // In a real application, we would save to a database
        subscriptions.push(subscription);

        // For demo purposes, we'll simulate different behaviors based on the plan
        if (planId === 'enterprise') {
          // Enterprise plan requires a custom checkout process
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Redirecting to enterprise checkout',
              checkoutUrl: '/checkout/enterprise',
            }),
            { status: 200, headers }
          );
        }

        // For basic and pro plans, create a direct subscription
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Subscription created successfully',
            subscription,
          }),
          { status: 200, headers }
        );
      } catch (error) {
        console.error('Subscription error:', error);
        return new Response(
          JSON.stringify({ success: false, message: error.message || 'Server error' }),
          { status: 500, headers }
        );
      }
    })
    .catch((error) => {
      console.error('Request processing error:', error);
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Server error' }),
        { status: 500, headers }
      );
    });
} 