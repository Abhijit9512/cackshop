import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Cake } from '../types/database';

interface CakeCardProps {
  cake: Cake;
  index?: number;
}

export default function CakeCard({ cake, index = 0 }: CakeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={cake.image_url}
          alt={cake.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-rose-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {cake.category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-gray-800 mb-2 group-hover:text-rose-700 transition-colors">
          {cake.name}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {cake.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Starting from</span>
            <span className="text-2xl font-bold text-rose-600">₹{cake.price}</span>
          </div>
          <Link
            to={`/cakes/${cake.id}`}
            className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:from-rose-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
