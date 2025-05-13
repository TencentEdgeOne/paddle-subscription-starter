import { createSupabaseAdminClient } from '../lib/supabase.js';
import { validateWebhookSignature, handleCustomerCreation, handleSubscriptionChange } from '../lib/paddle-utils.js';

// Webhook处理函数
export async function onRequest(context) {
  // 设置CORS头（开发模式）
  const headers = {
    'Content-Type': 'application/json',
  };

  if (context.env.NEXT_PUBLIC_DEV === 'true') {
    headers['Access-Control-Allow-Origin'] = '*';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Paddle-Signature';
  }

  // 处理预检请求
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 只允许POST请求
  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: '方法不允许' }),
      { status: 405, headers }
    );
  }

  try {
    // 1. 获取原始请求体 - 重要：不要对请求体做任何处理
    const rawBody = await context.request.text();
    let payload;
    
    try {
      // 解析JSON载荷
      payload = JSON.parse(rawBody);
      console.log('收到Paddle webhook:', JSON.stringify(payload));
    } catch (error) {
      console.error('解析webhook载荷失败:', error);
      return new Response(
        JSON.stringify({ success: false, message: '无效的JSON载荷' }),
        { status: 400, headers }
      );
    }

    // 2. 获取Paddle-Signature头
    const signatureHeader = context.request.headers.get('Paddle-Signature');
    const webhookSecret = context.env.PADDLE_WEBHOOK_SECRET;
    
    // 3. 验证签名
    if (webhookSecret && signatureHeader) {
      // 因为validateWebhookSignature函数需要原始JSON字符串，这里我们需要将payload重新转换回字符串
      const { isValid, message } = await validateWebhookSignature(payload, signatureHeader, webhookSecret);
      
      if (!isValid) {
        console.warn('签名验证失败');
        return new Response(
          JSON.stringify({ success: false, message: '无效的签名:' + message }),
          { status: 401, headers }
        );
      }
      
      console.log('签名验证成功');
    } else {
      // 仅在开发环境中允许未验证的webhook
      if (context.env.NEXT_PUBLIC_DEV !== 'true') {
        console.warn('生产环境中缺少webhook密钥或签名');
        return new Response(
          JSON.stringify({ success: false, message: '请求缺少必要的验证信息' }),
          { status: 401, headers }
        );
      }
      console.warn('开发模式：跳过webhook签名验证');
    }

    // 初始化Supabase客户端
    const supabase = createSupabaseAdminClient(context);

    // 根据事件类型处理不同事件
    const eventType = payload.event_type;
    const eventData = payload.data;
    
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionChange(supabase, eventData);
        break;
        
      case 'subscription.canceled':
        // 更新订阅状态为已取消
        await supabase
          .from('subscriptions')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('subscription_id', eventData.id);
        break;
        
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerCreation(supabase, eventData);
        break;
        
      default:
        // 记录但不处理其他事件类型
        console.log(`忽略事件 ${eventType}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('处理webhook时出错:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || '服务器错误' }),
      { status: 500, headers }
    );
  }
} 