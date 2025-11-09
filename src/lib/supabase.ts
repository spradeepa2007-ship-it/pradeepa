import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  rfid_card_id: string | null;
  role: 'student' | 'staff' | 'admin';
  balance: number;
  created_at: string;
};

export type MenuItem = {
  id: number;
  name: string;
  category: 'breakfast' | 'lunch' | 'breaktime' | 'dinner';
  price: number;
  image_url: string;
  available: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  order_code: string;
  user_id: string;
  items: OrderItem[];
  total_items: number;
  total_amount: number;
  previous_balance: number;
  remaining_balance: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
};

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type RechargeTransaction = {
  id: string;
  recharge_code: string;
  user_id: string;
  amount: number;
  payment_mode: 'UPI' | 'NetBanking' | 'Card' | 'Wallet';
  transaction_status: 'pending' | 'success' | 'failed';
  created_at: string;
};
