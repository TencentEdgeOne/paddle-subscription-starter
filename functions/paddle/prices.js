import { callPaddleApi, getProductDetails } from '../lib/paddle-utils.js';

/**
 * 端点获取Paddle价格信息
 */
export async function onRequest(context) {
  // 设置CORS头（开发模式）
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 只允许GET请求
  if (context.request.method !== 'GET') {
    return new Response(
      JSON.stringify({ success: false, message: '方法不允许' }),
      { status: 405, headers }
    );
  }

  try {
    // 使用工具函数调用Paddle API获取价格
    const priceData = await callPaddleApi(context, `/prices?order_by=unit_price.amount[ASC]`, 'GET');
    
    // 提取产品ID
    const productIds = priceData.data.map(price => price.product_id);
    
    // 获取产品详情
    const products = await getProductDetails(context, productIds);
    
    // 创建产品ID到产品详情的映射
    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = product;
    });
    
    // 合并价格和产品信息
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

    // 返回价格信息
    return new Response(
      JSON.stringify({ success: true, prices: formattedPrices }),
      { status: 200, headers }
    );

  } catch (error) {
    console.error('获取价格时出错:', error);

    // 如果API调用失败，使用默认硬编码数据作为备用
    const fallbackPrices = [
      {
        id: 'pri_01h9ztd4j58jrvwhbpdv99qpgq',
        product_id: 'pro_01h9zt8gkce7c0wh503qjjm87g',
        name: 'Basic Plan',
        description: 'Basic features for individual users',
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

    console.log('使用备用价格数据');
    return new Response(
      JSON.stringify({ 
        success: true, 
        prices: fallbackPrices,
        note: '使用备用数据，因为API调用失败'
      }),
      { status: 200, headers }
    );
  }
} 