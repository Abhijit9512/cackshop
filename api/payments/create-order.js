import supabase from '../_supabase.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', order_id, customer_name, phone, address, delivery_date, instructions, items } = req.body;

    // Create order in database first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        phone,
        address,
        delivery_date,
        instructions,
        total_price: amount,
        status: 'Pending Payment'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      cake_id: item.cake_id,
      cake_name: item.cake_name,
      weight: item.weight,
      quantity: item.quantity,
      message_on_cake: item.message_on_cake || '',
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Create Razorpay order using fetch (no SDK needed)
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      // Demo mode - return mock order for testing
      const mockOrderId = 'order_demo_' + crypto.randomBytes(8).toString('hex');
      
      // Create payment record
      await supabase.from('payments').insert({
        order_id: order.id,
        razorpay_order_id: mockOrderId,
        amount: amount,
        currency: currency,
        status: 'created'
      });

      return res.status(200).json({
        id: mockOrderId,
        amount: amount * 100,
        currency: currency,
        order_id: order.id,
        demo_mode: true
      });
    }

    // Real Razorpay integration
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency,
        receipt: order.id,
        notes: {
          order_id: order.id,
          customer_name: customer_name
        }
      })
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      throw new Error(errorData.error?.description || 'Failed to create Razorpay order');
    }

    const razorpayOrder = await razorpayResponse.json();

    // Create payment record
    await supabase.from('payments').insert({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: amount,
      currency: currency,
      status: 'created'
    });

    return res.status(200).json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: order.id
    });
  } catch (err) {
    console.error('Payment order creation error:', err);
    res.status(500).json({ error: err.message });
  }
}
