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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, demo_mode } = req.body;

    // Demo mode - skip verification
    if (demo_mode) {
      // Update payment status
      await supabase
        .from('payments')
        .update({
          razorpay_payment_id: 'demo_payment_' + crypto.randomBytes(8).toString('hex'),
          status: 'paid'
        })
        .eq('order_id', order_id);

      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'New' })
        .eq('id', order_id);

      return res.status(200).json({ success: true, order_id });
    }

    // Verify signature
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret key not configured');
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Update payment as failed
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment record
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid'
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // Update order status to New (payment received)
    await supabase
      .from('orders')
      .update({ status: 'New' })
      .eq('id', order_id);

    return res.status(200).json({ success: true, order_id });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: err.message });
  }
}
