import { motion } from 'framer-motion';
import { Cake } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 rounded-full"
      >
        <Cake className="w-8 h-8 text-white" />
      </motion.div>
      <p className="mt-4 text-gray-500 font-medium">Loading delicious cakes...</p>
    </div>
  );
}
