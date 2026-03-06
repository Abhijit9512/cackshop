import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../types/database';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl shadow-md p-4 flex gap-4"
    >
      <img
        src={item.image_url}
        alt={item.cake_name}
        className="w-24 h-24 object-cover rounded-lg"
      />
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gray-800">{item.cake_name}</h3>
            <p className="text-sm text-gray-500">{item.weight}</p>
            {item.message_on_cake && (
              <p className="text-xs text-rose-600 mt-1">
                Message: "{item.message_on_cake}"
              </p>
            )}
          </div>
          <button
            onClick={() => removeFromCart(item.cake_id, item.weight)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2">
            <button
              onClick={() => updateQuantity(item.cake_id, item.weight, item.quantity - 1)}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.cake_id, item.weight, item.quantity + 1)}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-lg font-bold text-rose-600">₹{item.price}</span>
        </div>
      </div>
    </motion.div>
  );
}
