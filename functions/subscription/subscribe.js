import jwt from 'jsonwebtoken';

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
  let userId;

  try {
    const decoded = jwt.verify(token, context.env.JWT_SECRET || 'your_jwt_secret_key_here');
    userId = decoded.id;
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers }
    );
  }

  return context.request.json()
    .then((data) => {
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
    })
    .catch((error) => {
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Server error' }),
        { status: 500, headers }
      );
    });
} 