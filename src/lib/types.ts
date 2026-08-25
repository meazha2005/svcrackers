export interface Category {
  id: number;
  name: string;
  description?: string | null;
  product_count?: number;
  created_at?: string;
}

export interface Unit {
  id: number;
  name: string;
  symbol: string;
  product_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  category_id?: number | null;
  unit_id?: number | null;
  category_name?: string;
  unit_name?: string;
  unit_symbol?: string;
  mrp_rate: number;
  discounted_rate?: number | null;
  stock_quantity: number;
  image_url?: string | null;
  is_active: number;
  created_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: string;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  unit_symbol?: string;
}

export interface Order {
  id?: number;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  is_stock_deducted?: number;
  created_at: string;
  item_count?: number;
  items?: OrderItem[];
}

export interface StoreSettings {
  store_name: string;
  store_address: string;
  store_phone: string;
  store_email: string;
  telegram_bot_token?: string;
  telegram_chat_id?: string;
}
