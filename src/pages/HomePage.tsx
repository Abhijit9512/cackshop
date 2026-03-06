import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, Star, ArrowRight, Sparkles, Heart, Award } from 'lucide-react';
import CakeCard from '../components/CakeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Cake as CakeType, Category } from '../types/database';

const categories: { name: Category; icon: string; color: string }[] = [
  { name: 'Birthday', icon: '🎂', color: 'from-pink-500 to-rose-500' },
  { name: 'Chocolate', icon: '🍫', color: 'from-amber-700 to-yellow-900' },
  { name: 'Wedding', icon: '💒', color: 'from-purple-500 to-pink-500' },
  { name: 'Eggless', icon: '🌱', color: 'from-green-500 to-emerald-500' },
];

const reviews = [
  {
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'The chocolate truffle cake was absolutely divine! Best cake I\'ve ever had.',
    avatar: 'S',
  },
  {
    name: 'Michael Chen',
    rating: 5,
    comment: 'Ordered a wedding cake and it exceeded all expectations. Beautiful and delicious!',
    avatar: 'M',
  },
  {
    name: 'Priya Sharma',
    rating: 5,
    comment: 'The eggless options are amazing. Finally found a bakery that caters to everyone!',
    avatar: 'P',
  },
];

export default function HomePage() {
  const [featuredCakes, setFeaturedCakes] = useState<CakeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const res = await fetch('/api/cakes');
        const data = await res.json();
        setFeaturedCakes(data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching cakes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCakes();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-bakery.jpg"
            alt="Bakery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-950/90 via-rose-900/70 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Handcrafted with Love</span>
            </motion.div>
            
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Baked Fresh,
              <span className="block text-amber-400">Served with Love</span>
            </h1>
            
            <p className="text-xl text-rose-100 mb-8 leading-relaxed">
              Indulge in our artisanal cakes crafted with premium ingredients 
              and decades of baking expertise. Every bite tells a story.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link
                to="/cakes"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Cake className="w-5 h-5" />
                Order Now
              </Link>
              <Link
                to="/cakes"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all border border-white/30"
              >
                View Menu
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-10 right-10 hidden lg:block"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <Award className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Award Winning</p>
                <p className="text-sm text-gray-500">Best Bakery 2024</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-gray-800 mb-4">
              Explore Our Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From classic flavors to modern creations, find the perfect cake for every occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/cakes?category=${category.name}`}
                  className="group block"
                >
                  <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-6 text-center text-white shadow-lg group-hover:shadow-xl transition-all transform group-hover:-translate-y-1`}>
                    <span className="text-5xl block mb-3">{category.icon}</span>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cakes Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="font-serif text-4xl font-bold text-gray-800 mb-2">
                Featured Cakes
              </h2>
              <p className="text-gray-600">Our most loved creations</p>
            </div>
            <Link
              to="/cakes"
              className="hidden md:inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCakes.map((cake, index) => (
                <CakeCard key={cake.id} cake={cake} index={index} />
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/cakes"
              className="inline-flex items-center gap-2 text-rose-600 font-semibold"
            >
              View All Cakes
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-4xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it — hear from our happy customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {review.avatar}
                  </div>
                  <span className="font-semibold text-gray-800">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Heart className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Make Your Day Sweeter?
            </h2>
            <p className="text-xl text-rose-100 mb-8">
              Order now and get your cake delivered fresh to your doorstep
            </p>
            <Link
              to="/cakes"
              className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-50 transition-all shadow-lg"
            >
              <Cake className="w-5 h-5" />
              Browse Our Menu
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
