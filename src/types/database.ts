export interface Cake {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  cake_id: string;
  cake_name: string;
  image_url: string;
  weight: string;
  quantity: number;
  message_on_cake: string;
  price: number;
  base_price: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  cake_id: string;
  cake_name: string;
  weight: string;
  quantity: number;
  message_on_cake: string;
  price: number;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_date: string;
  instructions: string;
  status: 'Pending Payment' | 'New' | 'Preparing' | 'Completed' | 'Delivered';
  total_price: number;
  created_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  status: 'pending' | 'created' | 'paid' | 'failed';
  created_at: string;
}

export type Category = 'All' | 'Birthday' | 'Chocolate' | 'Wedding' | 'Eggless';
