import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Home, Phone, CreditCard } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12">
      <div className="max-w-lg mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-serif text-4xl font-bold text-gray-800 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-gray-600 text-lg mb-6">
            Thank you for your order. We're preparing your delicious cakes with love!
          </p>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-rose-600" />
              <span className="text-sm text-gray-500">Order ID</span>
            </div>
            <p className="font-mono text-xl font-bold text-gray-800 bg-gray-100 py-3 px-4 rounded-lg">
              {orderId?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">Payment Confirmed</span>
            </div>
            <p className="text-green-600 text-sm">
              Your payment has been successfully processed.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <p className="text-amber-800 text-sm">
              <strong>What's Next?</strong><br />
              You'll receive order updates via SMS. Our team will contact you before delivery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <a
              href="tel:+15551234567"
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <Phone className="w-5 h-5" />
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
