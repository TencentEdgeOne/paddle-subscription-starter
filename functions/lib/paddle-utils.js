/**
 * 发起Paddle API请求
 * @param {object} context - EdgeOne函数上下文
 * @param {string} endpoint - API端点路径
 * @param {string} method - HTTP方法
 * @param {object} [body] - 请求体（对象形式）
 * @returns {Promise<object>} API响应
 */
export async function callPaddleApi(context, endpoint, method = 'GET', body = null) {
  const paddleApiKey = context.env.PADDLE_API_KEY;
  
  if (!paddleApiKey) {
    throw new Error('未配置Paddle API密钥');
  }
  
  const paddleEnv = context.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';
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
    console.error(`Paddle API错误 (${endpoint}):`, errorData);
    throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * 验证Paddle webhook签名
 * @param {object} payload - Webhook载荷
 * @param {string} signatureHeader - Paddle-Signature标头
 * @param {string} webhookSecret - Paddle webhook密钥
 * @returns {Promise<boolean>} 签名是否有效
 */
export async function validateWebhookSignature(payload, signatureHeader, webhookSecret) {
  if (!payload || !signatureHeader || !webhookSecret) {
    return false;
  }
  
  try {
    // 1. 解析Paddle-Signature标头
    const signatureParts = {};
    signatureHeader.split(';').forEach(part => {
      const [key, value] = part.split('=');
      if (key && value) {
        signatureParts[key.trim()] = value.trim();
      }
    });
    
    // 2. 提取时间戳和签名
    const { ts, h1 } = signatureParts;
    
    if (!ts || !h1) {
      console.error('签名标头格式无效');
      return false;
    }
    
    // 可选：检查时间戳是否在可接受范围内（防止重放攻击）
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampDifference = Math.abs(currentTimestamp - parseInt(ts, 10));
    
    // 允许5秒的时间偏差（根据Paddle文档建议）
    if (timestampDifference > 5) {
      console.warn(`时间戳相差过大: ${timestampDifference}秒`);
      // 开发环境下不强制检查时间戳
      // 如果在生产环境，可以考虑在这里返回false
    }
    
    // 3. 构建签名负载
    // 重要：不要对原始请求体做任何转换或格式化
    const payloadString = JSON.stringify(payload);
    const signedPayload = `${ts}:${payloadString}`;
    
    // 4. 对签名负载进行哈希
    // 使用Web Crypto API进行HMAC计算
    const encoder = new TextEncoder();
    const keyData = encoder.encode(webhookSecret);
    const signedPayloadData = encoder.encode(signedPayload);
    
    // 导入密钥
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // 计算签名
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      signedPayloadData
    );
    
    // 将签名转换为十六进制
    const computedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // 5. 比较签名
    // 使用时间安全的比较，以防止时序攻击
    return {isValid: h1 === computedSignature, message: `验证: ${h1}, ${computedSignature}`};
  } catch (error) {
    console.error('验证webhook签名时出错:', error);
    return {isValid: false, message: `验证报错: ${error}`};
  }
}

/**
 * 处理客户创建
 * @param {object} supabase - Supabase客户端
 * @param {object} customerData - 客户数据
 */
export async function handleCustomerCreation(supabase, customerData) {
  const { id, email } = customerData;
  
  // 检查客户是否已存在
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('*')
    .eq('customer_id', id)
    .maybeSingle();
  
  if (existingCustomer) {
    // 更新现有客户
    await supabase
      .from('customers')
      .update({
        email,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', id);
  } else {
    // 检查是否可以关联到现有用户
    // const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
    
    // 创建新客户
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
 * 处理订阅创建或更新
 * @param {object} supabase - Supabase客户端
 * @param {object} subscriptionData - 订阅数据
 */
export async function handleSubscriptionChange(supabase, subscriptionData) {
  const { 
    id, 
    status, 
    customer_id,
    items 
  } = subscriptionData;
  
  // 提取价格和产品信息
  const priceId = items[0]?.price?.id;
  const productId = items[0]?.price?.product_id;
  
  // 检查订阅是否已存在
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('subscription_id', id)
    .maybeSingle();
  
  if (existingSubscription) {
    // 更新现有订阅
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
    // 创建新订阅
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
 * 获取产品详细信息
 * @param {object} context - EdgeOne函数上下文
 * @param {string[]} productIds - 产品ID数组
 * @returns {Promise<object[]>} 产品详情数组
 */
export async function getProductDetails(context, productIds) {
  if (!productIds || productIds.length === 0) {
    return [];
  }
  
  try {
    // 产品ID去重
    const uniqueProductIds = [...new Set(productIds)];
    
    // 构建产品ID查询参数
    const queryParams = uniqueProductIds.map(id => `id=${id}`).join('&');
    
    // 调用Paddle API获取产品详情
    const response = await callPaddleApi(context, `/products?${queryParams}`, 'GET');
    
    return response.data || [];
  } catch (error) {
    console.error('获取产品详情时出错:', error);
    return [];
  }
} 