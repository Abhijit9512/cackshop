import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import CakeCard from '../components/CakeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Cake, Category } from '../types/database';

const categories: Category[] = ['All', 'Birthday', 'Chocolate', 'Wedding', 'Eggless'];

export default function CakesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    (searchParams.get('category') as Category) || 'All'
  );

  useEffect(() => {
    const fetchCakes = async () => {
      setLoading(true);
      try {
        const url = selectedCategory === 'All' 
          ? '/api/cakes' 
          : `/api/cakes?category=${selectedCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        setCakes(data);
      } catch (err) {
        console.error('Error fetching cakes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCakes();
  }, [selectedCategory]);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const filteredCakes = cakes.filter(cake =>
    cake.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cake.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-800 to-pink-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Our Cake Menu
            </h1>
            <p className="text-rose-200 text-lg max-w-2xl mx-auto">
              Discover our handcrafted cakes made with love and the finest ingredients
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cakes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all bg-white shadow-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-5 h-5 text-gray-400 hidden md:block" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-rose-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <p className="text-gray-500 mb-6">
            Showing {filteredCakes.length} cake{filteredCakes.length !== 1 ? 's' : ''}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        )}

        {/* Cakes Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredCakes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No cakes found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCakes.map((cake, index) => (
              <CakeCard key={cake.id} cake={cake} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
