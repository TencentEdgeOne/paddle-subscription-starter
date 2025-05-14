import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Subscription = {
  subscription_id: string;
  subscription_status: 'active' | 'trialing' | 'paused' | 'canceled' | 'past_due';
  price_id: string;
  product_id: string;
  scheduled_change: string | null;
  customer_id: string;
  created_at: string;
  updated_at: string;
};

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const { data: customer } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', userId)
    .single();

  if (!customer) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customer.customer_id)
    .in('subscription_status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return subscription || null;
} 