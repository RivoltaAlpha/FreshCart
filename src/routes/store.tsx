import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Search, MapPin, Heart, ChevronDown } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import type { Store } from '@/types/store';

export const Route = createFileRoute('/store')({
  component: StoreLayout,
});

function StoreLayout() {
  const [activeTab, setActiveTab] = useState('Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImageOnly, setShowImageOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [dietaryOpen, setDietaryOpen] = useState(true);
  const { stores, loading: isLoading, error } = useStore();

  const filterOptions = [
    { id: 'verified', name: 'Verified Stores', count: 5 },
    { id: 'fastDelivery', name: 'Fast Delivery', count: 8 },
    { id: 'topRated', name: 'Top Rated', count: 3 }
  ];

  const filteredStores = stores?.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  const StoreCard = ({ store }: { store: Store }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {store.image_url ? (
            <img
              src={store.image_url}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">🏪</div>
          )}
        </div>
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
          <Heart size={16} className="text-gray-400" />
        </button>
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
          {store.is_active ? 'Open' : 'Closed'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{store.description}</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {store.city?.charAt(0) || 'S'}
            </span>
          </div>
          <span className="text-sm text-gray-600">{store.city || 'Location'}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600">{store.rating}</span>
            <span className="text-sm text-gray-500">({store.total_reviews} reviews)</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Delivery fee:</span>
            <span className="font-bold text-lg">KSh {store.delivery_fee}</span>
          </div>
          <div className="text-sm text-gray-500">
            <MapPin size={16} className="inline mr-1" />
            {store.town}
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
            <img src="./market-concept-with-vegetables.jpg" alt="Fresh Stores" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Browse Local Stores</h1>
            <p className="text-gray-600 mt-2">Discover fresh products from trusted local vendors</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['Stores', 'Featured'].map((tab) => (
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
                  placeholder="Search stores..."
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

            {/* Filter Options */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <button
                onClick={() => setDietaryOpen(!dietaryOpen)}
                className="flex items-center justify-between w-full text-left font-medium"
              >
                Store Features
                <ChevronDown size={16} className={`transform transition-transform ${dietaryOpen ? `rotate-180` : ``}`} />
              </button>
              {dietaryOpen && (
                <div className="mt-4 space-y-2">
                  {filterOptions.map((option) => (
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

          {/* Stores Grid */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Show all stores ({filteredStores.length})
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
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name A-Z</option>
                    <option value="delivery_fee">Delivery Fee</option>
                    <option value="city">Location</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">Loading stores...</div>
              ) : error ? (
                <div className="col-span-full text-center py-8 text-red-500">
                  Error loading stores: {error}
                </div>
              ) : filteredStores.length > 0 ? (
                filteredStores.map((store) => (
                  <StoreCard key={store.store_id} store={store} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No stores found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreLayout;