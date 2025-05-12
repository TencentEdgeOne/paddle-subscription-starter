import jwt from 'jsonwebtoken';

// Mock user database - in a real application this would be a database
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
      const { name, email, password } = data;

      if (!name || !email || !password) {
        return new Response(
          JSON.stringify({ success: false, message: 'Name, email, and password are required' }),
          { status: 400, headers }
        );
      }

      // Check if email already exists
      if (users.some(user => user.email === email)) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email is already registered' }),
          { status: 409, headers }
        );
      }

      // Create a new user
      const newUser = {
        id: String(users.length + 1),
        name,
        email,
        password,
      };

      // In a real application, we would add the user to a database
      users.push(newUser);

      // Create JWT token
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        context.env.JWT_SECRET || 'your_jwt_secret_key_here',
        { expiresIn: '24h' }
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Registration successful',
          token,
          user: { id: newUser.id, email: newUser.email, name: newUser.name }
        }),
        { status: 201, headers }
      );
    })
    .catch((error) => {
      return new Response(
        JSON.stringify({ success: false, message: error.message || 'Server error' }),
        { status: 500, headers }
      );
    });
} 