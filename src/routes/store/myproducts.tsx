import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useStoreProducts, useStores } from '../../hooks/useStore';
import type { StoreProduct, Store } from '../../types/store';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Package, 
  DollarSign,
  TrendingUp,
  Eye,
  RefreshCw,
  Grid,
  List,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const Route = createFileRoute('/store/myproducts')({
  component: MyProductsPage,
});

function MyProductsPage() {
  const navigate = useNavigate();
  
  // State management
  const [selectedStoreId, setSelectedStoreId] = useState<number>(2); // Default store ID
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Hooks
  const { stores, loading: storesLoading } = useStores();
  const { 
    products, 
    loading, 
    error, 
    total, 
    hasMore, 
    searchProducts, 
    loadMore, 
    refresh 
  } = useStoreProducts({ 
    storeId: selectedStoreId,
    limit: 12 
  });

  // Get unique categories from products
  const categories = React.useMemo(() => {
    const uniqueCategories = products.reduce((acc, product) => {
      if (!acc.find(cat => cat.category_id === product.category.category_id)) {
        acc.push(product.category);
      }
      return acc;
    }, [] as Array<{category_id: number, name: string}>);
    return uniqueCategories;
  }, [products]);

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchProducts(searchQuery, selectedCategory);
    } else {
      refresh();
    }
  };

  // Get current store
  const currentStore = stores.find(store => store.store_id === selectedStoreId);

  // Product stats
  const productStats = React.useMemo(() => {
    const totalValue = products.reduce((sum, product) => 
      sum + (parseFloat(product.price) * parseInt(product.stock_quantity)), 0
    );
    const averageRating = products.reduce((sum, product) => 
      sum + parseFloat(product.rating), 0
    ) / products.length;
    const lowStockProducts = products.filter(product => 
      parseInt(product.stock_quantity) < 10
    ).length;

    return {
      totalProducts: total,
      totalValue,
      averageRating: averageRating || 0,
      lowStockProducts
    };
  }, [products, total]);

  const ProductCard: React.FC<{ product: StoreProduct }> = ({ product }) => {
    const discountedPrice = parseFloat(product.price) * (1 - product.discount / 100);
    const isLowStock = parseInt(product.stock_quantity) < 10;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <div className="relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Product+Image';
            }}
          />
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
              -{product.discount}%
            </div>
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {isLowStock && (
              <div className="bg-orange-500 text-white p-1 rounded-full">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            {parseInt(product.stock_quantity) > 0 ? (
              <div className="bg-green-500 text-white p-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="bg-red-500 text-white p-1 rounded-full">
                <XCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-[#005A61] line-clamp-2">
              {product.name}
            </h3>
            <span className="text-sm text-[#6A89A7] bg-[#F9FBFC] px-2 py-1 rounded">
              {product.category.name}
            </span>
          </div>

          <p className="text-[#516E89] text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-[#516E89] ml-1">
                {product.rating} ({product.review_count} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {product.discount > 0 ? (
                <>
                  <span className="text-lg font-bold text-[#00A7B3]">
                    KSh {discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    KSh {product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-[#00A7B3]">
                  KSh {product.price}
                </span>
              )}
            </div>
            <span className="text-sm text-[#516E89]">
              {product.weight} {product.unit}
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className={`text-sm px-2 py-1 rounded ${
              isLowStock 
                ? 'bg-orange-100 text-orange-700' 
                : parseInt(product.stock_quantity) > 0 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
            }`}>
              Stock: {product.stock_quantity}
            </span>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-[#00A7B3] hover:bg-[#0096a2] text-white py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1">
              <Eye className="w-4 h-4" />
              View
            </button>
            <button className="flex-1 bg-[#005A61] hover:bg-[#004A50] text-white py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-1">
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md transition-colors text-sm font-medium flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProductListItem: React.FC<{ product: StoreProduct }> = ({ product }) => {
    const discountedPrice = parseFloat(product.price) * (1 - product.discount / 100);
    const isLowStock = parseInt(product.stock_quantity) < 10;

    return (
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow duration-200">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Product';
          }}
        />

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-[#005A61]">{product.name}</h3>
              <span className="text-sm text-[#6A89A7]">{product.category.name}</span>
            </div>
            <div className="text-right">
              {product.discount > 0 ? (
                <div>
                  <span className="text-lg font-bold text-[#00A7B3]">
                    KSh {discountedPrice.toFixed(2)}
                  </span>
                  <div className="text-sm text-gray-500 line-through">
                    KSh {product.price}
                  </div>
                </div>
              ) : (
                <span className="text-lg font-bold text-[#00A7B3]">
                  KSh {product.price}
                </span>
              )}
            </div>
          </div>

          <p className="text-[#516E89] text-sm mb-2 line-clamp-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-[#516E89] ml-1">
                  {product.rating} ({product.review_count})
                </span>
              </div>
              <span className={`text-sm px-2 py-1 rounded ${
                isLowStock 
                  ? 'bg-orange-100 text-orange-700' 
                  : parseInt(product.stock_quantity) > 0 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                Stock: {product.stock_quantity}
              </span>
            </div>

            <div className="flex gap-2">
              <button className="bg-[#00A7B3] hover:bg-[#0096a2] text-white py-1 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" />
                View
              </button>
              <button className="bg-[#005A61] hover:bg-[#004A50] text-white py-1 px-3 rounded-md transition-colors text-sm font-medium flex items-center gap-1">
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md transition-colors text-sm font-medium">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (storesLoading) {
    return (
      <div className="min-h-screen bg-[#F9FBFC] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#00A7B3] mx-auto mb-4" />
          <p className="text-[#516E89]">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFC]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[#E1EAF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#005A61]">My Products</h1>
              <p className="text-[#516E89] mt-1">
                Manage your store inventory and product listings
              </p>
            </div>
            <button 
              onClick={() => navigate({ to: '/store/create-product' })}
              className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Store Selector & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Store Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#005A61]">Store Selection</h2>
            <button
              onClick={refresh}
              className="text-[#00A7B3] hover:text-[#0096a2] transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div
                key={store.store_id}
                onClick={() => setSelectedStoreId(store.store_id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedStoreId === store.store_id
                    ? 'border-[#00A7B3] bg-[#E8F8FA]'
                    : 'border-[#E1EAF2] hover:border-[#B8D0DC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={store.image_url}
                    alt={store.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/48x48?text=Store';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-[#005A61]">{store.name}</h3>
                    <p className="text-sm text-[#516E89]">{store.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#516E89] text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold text-[#005A61]">{productStats.totalProducts}</p>
              </div>
              <div className="bg-[#E8F8FA] p-3 rounded-lg">
                <Package className="w-6 h-6 text-[#00A7B3]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#516E89] text-sm font-medium">Inventory Value</p>
                <p className="text-3xl font-bold text-[#005A61]">
                  KSh {productStats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-[#E8F8FA] p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-[#00A7B3]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#516E89] text-sm font-medium">Average Rating</p>
                <p className="text-3xl font-bold text-[#005A61]">
                  {productStats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="bg-[#E8F8FA] p-3 rounded-lg">
                <Star className="w-6 h-6 text-[#00A7B3]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#516E89] text-sm font-medium">Low Stock Alert</p>
                <p className="text-3xl font-bold text-orange-600">
                  {productStats.lowStockProducts}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6A89A7] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </form>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-[#E1EAF2] rounded-lg hover:bg-[#F9FBFC] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex border border-[#E1EAF2] rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#00A7B3] text-white' : 'text-[#6A89A7]'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#00A7B3] text-white' : 'text-[#6A89A7]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-[#E1EAF2]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#005A61] mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#005A61] mb-2">
                    Stock Status
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent">
                    <option value="">All Stock Levels</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#005A61] mb-2">
                    Sort By
                  </label>
                  <select className="w-full px-3 py-2 border border-[#E1EAF2] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent">
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="stock">Stock</option>
                    <option value="rating">Rating</option>
                    <option value="created">Date Created</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#00A7B3] mx-auto mb-4" />
            <p className="text-[#516E89]">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium">Error loading products</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products Grid/List */}
        {!loading && !error && products.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {products.map((product) => (
                  <ProductListItem key={product.product_id} product={product} />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-[#B8D0DC] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#005A61] mb-2">No products found</h3>
            <p className="text-[#516E89] mb-6">
              {searchQuery 
                ? `No products match your search for "${searchQuery}"`
                : "Start by adding your first product to the store"
              }
            </p>
            <button 
              onClick={() => navigate({ to: '/store/create-product' })}
              className="bg-[#00A7B3] hover:bg-[#0096a2] text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}