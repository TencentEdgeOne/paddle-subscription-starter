import jwt from 'jsonwebtoken';

// Mock user database
const users = [
  { id: '1', email: 'user@example.com', password: 'password123', name: 'Test User' }
];

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

  return context.request.json()
    .then((data) => {
      const { email, password } = data;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email and password are required' }),
          { status: 400, headers }
        );
      }

      // Find user
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid email or password' }),
          { status: 401, headers }
        );
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        context.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Login successful',
          token,
          user: { id: user.id, email: user.email, name: user.name }
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