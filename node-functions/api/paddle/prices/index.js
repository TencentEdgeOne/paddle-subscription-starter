import { callPaddleApi, getProductDetails } from '../../lib/paddle-utils.js';

/**
 * Endpoint to get Paddle price information
 */
export async function onRequest(context) {
  // Set CORS headers (development mode)
  const headers = {
    'Content-Type': 'application/json',
  };


  try {
    // Use utility function to call Paddle API for prices
    const priceData = await callPaddleApi(`/prices?order_by=unit_price.amount[ASC]`, 'GET');
    
    // Extract product IDs
    const productIds = priceData.data.map(price => price.product_id);
    
    // Get product details
    const products = await getProductDetails(productIds, context.env);
    
    // Create a mapping from product ID to product details
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = product;
    });
    
    // Merge price and product information
    const formattedPrices = priceData.data.map(price => {
      const product = productMap[price.product_id] || {};
      
      return {
        id: price.id,
        product_id: price.product_id,
        name: product.name || `Plan (${price.id})`,
        description: product.description || 'Subscription plan',
        features: product.custom_data?.features ? JSON.parse(product.custom_data?.features) : [],
        image_url: product.image_url,
        unit_price: {
          amount: price.unit_price.amount,
          currency_code: price.unit_price.currency_code
        },
        billing_cycle: {
          interval: price.billing_cycle?.interval || 'month',
          frequency: price.billing_cycle?.frequency || 1
        }
      };
    });

    // Return price information
    return new Response(
      JSON.stringify({ success: true, prices: formattedPrices }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('Error getting prices:', error);

    // If API call fails, use default hardcoded data as fallback
    const fallbackPrices = [
      {
        id: 'pri_01h9ztd4j58jrvwhbpdv99qpgq',
        product_id: 'pro_01h9zt8gkce7c0wh503qjjm87g',
        name: 'Basic Plan',
        description: 'Basic features for individual users',
        features: ['Core functionality', 'Single user', 'Basic storage', 'Standard support'],
        unit_price: {
          amount: '4900',
          currency_code: 'USD'
        },
        billing_cycle: {
          interval: 'month',
          frequency: 1
        }
      },
      {
        id: 'pri_01h9ztdy6y4tm0vkrdataf3rbr',
        product_id: 'pro_01h9zt9j6wq7f9k68patsgxttm',
        name: 'Professional Plan',
        description: 'Enhanced features for small teams',
        features: ['All basic features', 'Up to 5 users', 'Enhanced storage', 'Priority support', 'Advanced analytics'],
        unit_price: {
          amount: '9900',
          currency_code: 'USD'
        },
        billing_cycle: {
          interval: 'month',
          frequency: 1
        }
      },
      {
        id: 'pri_01h9zte7sz93y8r55v2x157swg',
        product_id: 'pro_01h9ztadhd2g4bvmfcj2t63dzk',
        name: 'Enterprise Plan',
        description: 'Complete suite for large organizations',
        features: ['All Professional features', 'Unlimited users', 'Enterprise-grade storage', '24/7 dedicated support', 'Custom integrations', 'Dedicated servers'],
        unit_price: {
          amount: '19900',
          currency_code: 'USD'
        },
        billing_cycle: {
          interval: 'month',
          frequency: 1
        }
      }
    ];

    console.log('Using fallback price data');
    return new Response(
      JSON.stringify({ 
        success: true, 
        prices: fallbackPrices,
        note: 'Using backup data because API call failed'
      }),
      { status: 200, headers }
    );
  }
} 