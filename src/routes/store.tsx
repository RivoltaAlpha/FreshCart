import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Search, MapPin, Heart, ChevronDown } from 'lucide-react';
import { useStoreProducts } from '@/hooks/useProducts';
import type { Product } from '@/types/types';

export const Route = createFileRoute('/store')({
  component: GroceryStoreLayout,
});

function GroceryStoreLayout() {
  const [activeTab, setActiveTab] = useState('Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showImageOnly, setShowImageOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Bestselling');
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [dietaryOpen, setDietaryOpen] = useState(true);
  const store = JSON.parse(localStorage.getItem('selected_store') || '{}') || {};
  const store_id = store.id || 8;
  const { data: storeProducts = [], isLoading, error } = useStoreProducts(store_id);
  const products: Product[] = storeProducts;

  const dietaryOptions = [
    { id: 'eco', name: 'Eco Friendly', count: 2 },
    { id: 'glutenFree', name: 'Gluten Free', count: 4 },
    { id: 'nutFree', name: 'Nut Free', count: 7 }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">📦</div>
          )}
        </div>
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
          <Heart size={16} className="text-gray-400" />
        </button>
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {product.category?.name?.charAt(0) || 'P'}
            </span>
          </div>
          <span className="text-sm text-gray-600">{product.category?.name || 'General'}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-sm text-gray-500">({product.review_count})</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-lg">KSh {product.price}</span>
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>
          <div className="text-sm text-gray-500">
            Stock: {product.stock_quantity}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with fresh produce image */}
      <div className="h-64 bg-gradient-to-r from-green-400 via-yellow-400 to-orange-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-30">
            <img src="./market-concept-with-vegetables.jpg" alt="Fresh Produce" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Store Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  🛒
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Grocery Store</h1>
                  <span className="text-green-500 text-lg">✓</span>
                </div>
                <p className="text-gray-600">Nairobi County</p>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Ngara Nairobi</span>
                  <button className="text-blue-500 text-sm hover:underline">Get Direction</button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">👤</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Owned by Tiff</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['Products', 'Photos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-500 text-sm mt-2 hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* Dietary */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <button
                onClick={() => setDietaryOpen(!dietaryOpen)}
                className="flex items-center justify-between w-full text-left font-medium"
              >
                Dietary
                <ChevronDown size={16} className={`transform transition-transform ${dietaryOpen ? `rotate-180` : ``}`} />
              </button>
              {dietaryOpen && (
                <div className="mt-4 space-y-2">
                  {dietaryOptions.map((option) => (
                    <label key={option.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{option.name} ({option.count})</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Show all products ({filteredProducts.length})
                </span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showImageOnly}
                    onChange={(e) => setShowImageOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Show image only</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option>Bestselling</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Name: A to Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">Loading products...</div>
              ) : error ? (
                <div className="col-span-full text-center py-8 text-red-500">
                  Error loading products: {error.message}
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroceryStoreLayout;