import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Calendar, MessageSquare, Loader2, CreditCard, Shield, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart, isLoaded } = useCart();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    delivery_date: '',
    instructions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [cartSnapshot, setCartSnapshot] = useState(cart);
  const [priceSnapshot, setPriceSnapshot] = useState(totalPrice);

  // Take a snapshot of cart when component mounts or cart loads
  useEffect(() => {
    if (isLoaded && cart.length > 0) {
      setCartSnapshot([...cart]);
      setPriceSnapshot(totalPrice);
    }
  }, [isLoaded, cart, totalPrice]);

  // Load Razorpay script
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      setRazorpayLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Redirect if cart is empty after loading (use effect to avoid render issues)
  useEffect(() => {
    if (isLoaded && cart.length === 0 && cartSnapshot.length === 0) {
      navigate('/cart');
    }
  }, [isLoaded, cart.length, cartSnapshot.length, navigate]);

  // Show loading while cart is loading
  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  // Use snapshot if original cart is empty but we have a snapshot (during payment processing)
  const displayCart = cart.length > 0 ? cart : cartSnapshot;
  const displayPrice = cart.length > 0 ? totalPrice : priceSnapshot;

  // If both are empty, show loading (redirect will happen via useEffect)
  if (displayCart.length === 0) {
    return <LoadingSpinner />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    if (!formData.delivery_date) {
      newErrors.delivery_date = 'Delivery date is required';
    } else {
      const selectedDate = new Date(formData.delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.delivery_date = 'Delivery date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOnlinePayment = async () => {
    // Use snapshot to preserve cart data during payment
    const orderCart = displayCart;
    const orderPrice = displayPrice;
    
    try {
      // Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderPrice,
          currency: 'INR',
          customer_name: formData.customer_name,
          phone: formData.phone,
          address: formData.address,
          delivery_date: formData.delivery_date,
          instructions: formData.instructions,
          items: orderCart.map(item => ({
            cake_id: item.cake_id,
            cake_name: item.cake_name,
            weight: item.weight,
            quantity: item.quantity,
            message_on_cake: item.message_on_cake,
            price: item.price,
          })),
        }),
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();

      // Demo mode - simulate successful payment
      if (orderData.demo_mode) {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderData.order_id,
            demo_mode: true
          }),
        });

        if (!verifyRes.ok) throw new Error('Payment verification failed');
        
        clearCart();
        navigate(`/order-confirmation/${orderData.order_id}`);
        return;
      }

      // Real Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sweet Delights Bakery',
        description: 'Cake Order Payment',
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.order_id,
            }),
          });

          if (!verifyRes.ok) {
            alert('Payment verification failed. Please contact support.');
            return;
          }

          clearCart();
          navigate(`/order-confirmation/${orderData.order_id}`);
        },
        prefill: {
          name: formData.customer_name,
          contact: formData.phone,
        },
        theme: {
          color: '#e11d48',
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCODPayment = async () => {
    // Use snapshot to preserve cart data
    const orderCart = displayCart;
    const orderPrice = displayPrice;
    
    try {
      const orderData = {
        ...formData,
        total_price: orderPrice,
        items: orderCart.map(item => ({
          cake_id: item.cake_id,
          cake_name: item.cake_name,
          weight: item.weight,
          quantity: item.quantity,
          message_on_cake: item.message_on_cake,
          price: item.price,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error('Failed to place order');

      const { order_id } = await res.json();
      clearCart();
      navigate(`/order-confirmation/${order_id}`);
    } catch (err) {
      console.error('Order error:', err);
      alert('Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    if (paymentMethod === 'online') {
      await handleOnlinePayment();
    } else {
      await handleCODPayment();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-serif text-3xl font-bold text-gray-800 mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="font-semibold text-lg text-gray-800 mb-6">
                    Delivery Details
                  </h2>

                  {/* Name */}
                  <div className="mb-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-rose-500" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.customer_name ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all`}
                    />
                    {errors.customer_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="mb-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 text-rose-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="mb-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      Delivery Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your full delivery address"
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.address ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none`}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Delivery Date */}
                  <div className="mb-5">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-rose-500" />
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleChange}
                      min={getMinDate()}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.delivery_date ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all`}
                    />
                    {errors.delivery_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.delivery_date}</p>
                    )}
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 text-rose-500" />
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Any special requests or delivery instructions..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="font-semibold text-lg text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-rose-500" />
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {/* Online Payment */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'online'
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="w-5 h-5 text-rose-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">Pay Online</span>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Credit/Debit Card, UPI, Net Banking, Wallets
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <img src="https://cdn.razorpay.com/static/assets/pay_methods_branding/upi.svg" alt="UPI" className="h-6" />
                        <img src="https://cdn.razorpay.com/static/assets/pay_methods_branding/card.svg" alt="Card" className="h-6" />
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-5 h-5 text-rose-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Cash on Delivery</span>
                        <p className="text-sm text-gray-500 mt-1">
                          Pay when your order is delivered
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Security Badge */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || (paymentMethod === 'online' && !razorpayLoaded)}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'online' ? (
                    <>
                      <Lock className="w-5 h-5" />
                      Pay ₹{displayPrice} Securely
                    </>
                  ) : (
                    'Place Order (COD)'
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="font-semibold text-lg text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {displayCart.map((item) => (
                    <div
                      key={`${item.cake_id}-${item.weight}`}
                      className="flex gap-3 text-sm"
                    >
                      <img
                        src={item.image_url}
                        alt={item.cake_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.cake_name}</p>
                        <p className="text-gray-500">
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{displayPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-rose-600">₹{displayPrice}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4 text-green-600" />
                      <span>Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
