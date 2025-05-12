import jwt from 'jsonwebtoken';

// Mock subscription database from other files
// In a real app, this would be a database query
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
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid token' }),
      { status: 401, headers }
    );
  }

  // Get the user's active subscription
  const subscriptionIndex = subscriptions.findIndex(
    sub => sub.userId === userId && sub.status === 'active'
  );

  if (subscriptionIndex === -1) {
    return new Response(
      JSON.stringify({ success: false, message: 'No active subscription found' }),
      { status: 404, headers }
    );
  }

  // Update subscription status to canceled
  subscriptions[subscriptionIndex].status = 'canceled';

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Subscription canceled successfully',
      subscription: subscriptions[subscriptionIndex],
    }),
    { status: 200, headers }
  );
} 