import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Cake } from '../types/database';

const weights = [
  { label: '500g', multiplier: 1 },
  { label: '1kg', multiplier: 1.8 },
  { label: '2kg', multiplier: 3.5 },
];

export default function CakeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [cake, setCake] = useState<Cake | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(weights[0]);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchCake = async () => {
      try {
        const res = await fetch(`/api/cakes/${id}`);
        if (!res.ok) throw new Error('Cake not found');
        const data = await res.json();
        setCake(data);
      } catch (err) {
        console.error('Error fetching cake:', err);
        navigate('/cakes');
      } finally {
        setLoading(false);
      }
    };
    fetchCake();
  }, [id, navigate]);

  const calculatePrice = () => {
    if (!cake) return 0;
    return Math.round(cake.price * selectedWeight.multiplier * quantity);
  };

  const handleAddToCart = () => {
    if (!cake) return;
    
    const unitPrice = Math.round(cake.price * selectedWeight.multiplier);
    
    addToCart({
      cake_id: cake.id,
      cake_name: cake.name,
      image_url: cake.image_url,
      weight: selectedWeight.label,
      quantity,
      message_on_cake: message,
      price: unitPrice * quantity,
      base_price: unitPrice,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <LoadingSpinner />;
  if (!cake) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-rose-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={cake.image_url}
                alt={cake.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-rose-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                {cake.category}
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {cake.name}
            </h1>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {cake.description}
            </p>

            {/* Weight Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Weight
              </label>
              <div className="flex gap-3">
                {weights.map((weight) => (
                  <button
                    key={weight.label}
                    onClick={() => setSelectedWeight(weight)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      selectedWeight.label === weight.label
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    {weight.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message on Cake */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Message on Cake (Optional)
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., Happy Birthday John!"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">{message.length}/50 characters</p>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="inline-flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div className="mt-auto pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm text-gray-500">Total Price</span>
                  <p className="text-4xl font-bold text-rose-600">₹{calculatePrice()}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-xl ${
                    added
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-6 h-6" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-6 h-6" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
