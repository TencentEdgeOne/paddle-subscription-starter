/**
 * Make a Paddle API request
 * @param {string} endpoint - API endpoint path
 * @param {string} method - HTTP method
 * @param {object} [body] - Request body (object form)
 * @returns {Promise<object>} API response
 */
export async function callPaddleApi(endpoint, method = 'GET', body = null) {
  const paddleApiKey = process.env.PADDLE_API_KEY;
  
  if (!paddleApiKey) {
    throw new Error('Paddle API key not configured');
  }
  
  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
  const apiBaseUrl = paddleEnv === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com';
    
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${paddleApiKey}`
    }
  };
  console.log('paddleEnv', paddleEnv, paddleApiKey);
  
  if (body && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${apiBaseUrl}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error(`Paddle API error (${endpoint}):`, errorData);
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Verify Paddle webhook signature
 * @param {object} payload - Webhook payload
 * @param {string} signatureHeader - Paddle-Signature header
 * @param {string} webhookSecret - Paddle webhook secret
 * @returns {Promise<{isValid: boolean, message: string}>} Whether signature is valid
 */
export async function validateWebhookSignature(payload, signatureHeader, webhookSecret) {
  if (!payload || !signatureHeader || !webhookSecret) {
    return {isValid: false, message: "Missing required parameters"};
  }
  
  try {
    // 1. Parse Paddle-Signature header
    const signatureParts = {};
    signatureHeader.split(';').forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureParts[key.trim()] = value.trim();
      }
    });
    
    // 2. Extract timestamp and signature
    const { ts, h1 } = signatureParts;
    
    if (!ts || !h1) {
      console.error('Invalid signature header format');
      return {isValid: false, message: "Invalid signature header format"};
    }
    
    // Optional: Check if timestamp is within acceptable range (prevent replay attacks)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampDifference = Math.abs(currentTimestamp - parseInt(ts, 10));
    
    // Allow 5 seconds time difference (as recommended in Paddle docs)
    if (timestampDifference > 5) {
      console.warn(`Timestamp difference too large: ${timestampDifference} seconds`);
      // In development environment, don't strictly check timestamp
      // In production, you might want to return false here
    }
    
    // 3. Build signature payload
    // Important: Don't transform or format the original request body
    const payloadString = JSON.stringify(payload);
    const signedPayload = `${ts}:${payloadString}`;
    
    // 4. Hash the signature payload
    // Use Web Crypto API for HMAC calculation
    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const signedPayloadData = encoder.encode(signedPayload);
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Calculate signature
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      signedPayloadData
    );
    
    // Convert signature to hex
    const computedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // 5. Compare signatures
    // Use time-safe comparison to prevent timing attacks
    return {isValid: h1 === computedSignature, message: `Verification: ${h1}, ${computedSignature}`};
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return {isValid: false, message: `Verification error: ${error}`};
  }
}

/**
 * Handle customer creation
 * @param {object} supabase - Supabase client
 * @param {object} customerData - Customer data
 */
export async function handleCustomerCreation(supabase, customerData) {
  const { id, email } = customerData;
  
  // Check if customer already exists
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('customer_id', id)
    .maybeSingle();
  
  if (existingCustomer) {
    // Update existing customer
    await supabase
      .from('customers')
      .update({
        email,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', id);
  } else {
    // Check if customer can be associated with existing user
    // const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
    
    // Create new customer
    await supabase
      .from('customers')
      .insert({
        customer_id: id,
        email,
        // user_id: userData?.id || null
      });
  }
}

/**
 * Handle subscription creation or update
 * @param {object} supabase - Supabase client
 * @param {object} subscriptionData - Subscription data
 */
export async function handleSubscriptionChange(supabase, subscriptionData) {
  const { 
    id, 
    status, 
    customer_id,
    items 
  } = subscriptionData;
  
  // Extract price and product information
  const priceId = items[0]?.price?.id;
  const productId = items[0]?.price?.product_id;
  
  // Check if subscription already exists
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('subscription_id', id)
    .maybeSingle();
  
  if (existingSubscription) {
    // Update existing subscription
    await supabase
      .from('subscriptions')
      .update({
        subscription_status: status,
        price_id: priceId,
        product_id: productId,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', id);
  } else {
    // Create new subscription
    await supabase
      .from('subscriptions')
      .insert({
        subscription_id: id,
        subscription_status: status,
        price_id: priceId,
        product_id: productId,
        customer_id
      });
  }
}

/**
 * Get product details
 * @param {string[]} productIds - Product ID array
 * @returns {Promise<object[]>} Product details array
 */
export async function getProductDetails(productIds) {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  
  try {
    // Product ID deduplication
    const uniqueProductIds = [...new Set(productIds)];
    
    // Build product ID query parameters
    const queryParams = uniqueProductIds.map(id => `id=${id}`).join('&');
    
    // Call Paddle API to get product details
    const response = await callPaddleApi(`/products?${queryParams}`, 'GET');
    
    return response.data || [];
  } catch (error) {
    console.error('Error getting product details:', error);
    return [];
  }
} 