import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useStore, useStoreProducts } from '../hooks/useStore';
import type { Store } from '../types/store';
import {
  MapPin,
  Phone,
  Mail,
  Star,
  Search,
  Filter,
  Grid,
  List,
  ShoppingBag,
  Eye,
  ChevronRight,
  RefreshCw,
  Store as StoreIcon,
  TrendingUp,
  Package,
  Users,
  Heart,
  Share2
} from 'lucide-react';

export const Route = createFileRoute('/stores')({
  component: StoresPage,
});

function StoresPage() {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'city' | 'town'>('rating');

  // Hooks
  const { stores, loading: storesLoading, error: storesError, refresh } = useStore();
  console.log('stores:', stores);
  const {
    products: selectedStoreProducts,
    loading: productsLoading
  } = useStoreProducts({
    storeId: selectedStore?.store_id || 0,
    limit: 6,
    autoFetch: !!selectedStore
  });

  // Filter and sort stores
  const filteredStores = React.useMemo(() => {
    if (!stores || stores.length === 0) {
      return [];
    }
    
    let filtered = stores.filter(store =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort stores
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'city':
          return a.city.localeCompare(b.city);
        case 'town':
          return a.town.localeCompare(b.town);
        default:
          return 0;
      }
    });

    return filtered;
  }, [stores, searchQuery, sortBy]);

  const StoreCard: React.FC<{ store: Store }> = ({ store }) => {
    return (
      <div className="bg-card rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
        onClick={() => setSelectedStore(store)}>
        <div className="relative">
          <img
            src={store.image_url}
            alt={store.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Store+Image';
            }}
          />
          <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
            <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
          </div>
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
            {store.is_active ? 'Open' : 'Closed'}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-fresh-primary line-clamp-1">
              {store.name}
            </h3>
            <div className="flex items-center bg-[#E8F8FA] px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-semibold text-fresh-primary ml-1">
                {store.rating}
              </span>
            </div>
          </div>

          <p className="text-[#516E89] text-sm mb-4 line-clamp-2">
            {store.description}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-fresh-secondary text-sm">
              <MapPin className="w-4 h-4 mr-2 text-[#00A7B3]" />
              {store.city}
            </div>
            <div className="flex items-center text-fresh-secondary text-sm">
              <MapPin className="w-4 h-4 mr-2 text-[#00A7B3]" />
              {store.town}
            </div>
            <div className="flex items-center text-fresh-secondary text-sm">
              <Phone className="w-4 h-4 mr-2 text-[#00A7B3]" />
              {store.contact_info}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate({ to: '/products', search: { store_id: store.store_id } });
              }}
              className="flex-1 bg-[#0b1452] hover:bg-[#0096a2] text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStore(store);
              }}
              className="bg-[#180061] hover:bg-[#004A50] text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StoreListItem: React.FC<{ store: Store }> = ({ store }) => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => setSelectedStore(store)}>
        <img
          src={store.image_url}
          alt={store.name}
          className="w-20 h-20 object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Store';
          }}
        />

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-[#005A61]">{store.name}</h3>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-[#516E89] ml-1">
                  {store.rating} rating
                </span>
                <span className={`ml-4 text-sm px-2 py-1 rounded-full ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {store.is_active ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[#516E89] text-sm mb-3 line-clamp-2">
            {store.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-[#516E89] text-sm">
                <MapPin className="w-4 h-4 mr-1 text-[#00A7B3]" />
                {store.city}
              </div>
              <div className="flex items-center text-[#516E89] text-sm">
                <Phone className="w-4 h-4 mr-1 text-[#00A7B3]" />
                {store.phone}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/products', search: { store_id: store.store_id } });
                }}
                className="bg-[#071374] hover:bg-[#0096a2] text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Now
              </button>
              <button className="bg-[#005A61] hover:bg-[#004A50] text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StoreModal: React.FC<{ store: Store; onClose: () => void }> = ({ store, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative">
            <img
              src={store.image_url}
              alt={store.name}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x300?text=Store+Image';
              }}
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
              {store.is_active ? 'Currently Open' : 'Currently Closed'}
            </div>
          </div>

          <div className="p-8">
            {/* Store Info */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-[#005A61] mb-2">{store.name}</h2>
                <div className="flex items-center mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold text-[#005A61] ml-2">
                    {store.rating} out of 5
                  </span>
                </div>
                <p className="text-[#516E89] text-lg">{store.description}</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F8FA] p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-[#00A7B3]" />
                </div>
                <div>
                  <p className="font-semibold text-[#005A61]">city</p>
                  <p className="text-[#516E89]">{store.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F8FA] p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-[#00A7B3]" />
                </div>
                <div>
                  <p className="font-semibold text-[#005A61]">Town</p>
                  <p className="text-[#516E89]">{store.town}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F8FA] p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-[#00A7B3]" />
                </div>
                <div>
                  <p className="font-semibold text-[#005A61]">Email</p>
                  <p className="text-[#516E89]">{store.contact_info}</p>
                </div>
              </div>
            </div>

            {/* Featured Products */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#005A61]">Featured Products</h3>
                <button
                  onClick={() => {
                    onClose();
                    navigate({ to: '/products', search: { store_id: store.store_id } });
                  }}
                  className="text-[#00A7B3] hover:text-[#0096a2] transition-colors flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {productsLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#00A7B3] mx-auto mb-2" />
                  <p className="text-[#516E89]">Loading products...</p>
                </div>
              ) : selectedStoreProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStoreProducts.map((product) => (
                    <div key={product.product_id} className="bg-gray-50 rounded-lg p-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x150?text=Product';
                        }}
                      />
                      <h4 className="font-semibold text-[#005A61] mb-1">{product.name}</h4>
                      <p className="text-sm text-[#516E89] mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#00A7B3]">KSh {product.price}</span>
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-[#516E89] ml-1">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-[#516E89]">No products available</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  onClose();
                  navigate({ to: '/products', search: { store_id: store.store_id } });
                }}
                className="flex-1 bg-[#00A7B3] hover:bg-[#0096a2] text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </button>
              <button
                onClick={() => window.open(`tel:${store.phone}`, '_self')}
                className="bg-[#005A61] hover:bg-[#004A50] text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background  min-h-screen">
      {/* Header */}
      <div className="shadow-sm border-b border-[#E1EAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-fresh-primary mb-4">
              Discover Local Stores
            </h1>
            <p className="text-xl text-fresh-secondary max-w-3xl mx-auto">
              Browse through our network of trusted local stores and find fresh, quality products
              delivered straight to your doorstep.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-[#120061] to-[#00A7B3] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gray-900 bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <StoreIcon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">{stores?.length || 0}</div>
              <div className="text-blue-100">Partner Stores</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-900 bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">4.7</div>
              <div className="text-blue-100">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-900 bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-blue-100">Products Available</div>
            </div>
            <div className="text-center">
              <div className="bg-gray-900 bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-searchbar rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6A89A7] w-5 h-5" />
              <input
                type="text"
                placeholder="Search stores by name, city, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent text-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 border border-[#E1EAF2] rounded-lg hover:bg-[#F9FBFC] transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>

              <div className="flex border border-[#E1EAF2] rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-[#00A7B3] text-white' : 'text-[#6A89A7]'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-[#00A7B3] text-white' : 'text-[#6A89A7]'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={refresh}
                className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-4 py-3 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-[#E1EAF2]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#005A61] mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'city')}
                    className="w-full px-3 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="city">city</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#005A61] mb-2">
                    Store Status
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent">
                    <option value="">All Stores</option>
                    <option value="open">Open Now</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#005A61] mb-2">
                    Rating
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent">
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {storesLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#00A7B3] mx-auto mb-4" />
            <p className="text-[#516E89] text-lg">Loading stores...</p>
          </div>
        )}

        {/* Error State */}
        {storesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-700 font-medium text-lg">Unable to load stores</p>
            <p className="text-red-600 mt-2">{storesError}</p>
            <button
              onClick={refresh}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stores Grid/List */}
        {!storesLoading && !storesError && filteredStores.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-[#516E89]">
                Showing {filteredStores.length} of {stores?.length || 0} stores
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStores.map((store) => (
                  <StoreCard key={store.store_id} store={store} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredStores.map((store) => (
                  <StoreListItem key={store.store_id} store={store} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!storesLoading && !storesError && filteredStores.length === 0 && (
          <div className="text-center py-16">
            <StoreIcon className="w-20 h-20 text-[#B8D0DC] mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-[#005A61] mb-4">No stores found</h3>
            <p className="text-[#516E89] text-lg mb-8">
              {searchQuery
                ? `No stores match your search for "${searchQuery}". Try adjusting your search terms.`
                : "No stores are currently available in your area."
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Store Modal */}
      {selectedStore && (
        <StoreModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
        />
      )}
    </div>
  );
}
