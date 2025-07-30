import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react';
import { useAllStoreProducts } from '@/hooks/useStore';
import type { ProductInStore } from '@/types/store';
import {
  Package,
  Search,
  Filter,
  Star,
  Edit3,
  Eye,
  Plus,
  XCircle,
  DollarSign,
  AlertTriangle,
  Scale
} from 'lucide-react'

export const Route = createFileRoute('/store/products')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = localStorage.getItem("currentStore") || '';
  const storeId = store ? JSON.parse(store).store_id : 0;
  const navigate = useNavigate();
  const { data: allProducts, isLoading, isError } = useAllStoreProducts(storeId);
  const [selectedProduct, setSelectedProduct] = useState<ProductInStore | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<string | 'all'>('all');

  const products = React.useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts.products)) return [];
    return allProducts.products.map((product: ProductInStore) => ({
      ...product,
    }));
  }, [allProducts]);

  // Filter products based on search and stock filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'in-stock' && product.stock_quantity > 0) ||
      (stockFilter === 'low-stock' && product.stock_quantity > 0 && product.stock_quantity <= 10) ||
      (stockFilter === 'out-of-stock' && product.stock_quantity === 0);

    return matchesSearch && matchesStock;
  });

  const openModal = (product: ProductInStore) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const getStockStatus = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (stockQuantity <= 10) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const getStockIcon = (stockQuantity: number) => {
    if (stockQuantity === 0) {
      return <XCircle className="h-4 w-4" />;
    } else if (stockQuantity <= 10) {
      return <AlertTriangle className="h-4 w-4" />;
    } else {
      return <Package className="h-4 w-4" />;
    }
  };

  // Product Details Modal Component
  const ProductDetailsModal = ({ product, onClose }: { product: ProductInStore, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-text transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <img
                src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            </div>
            <div className="md:w-2/3 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                <p className="text-text mt-2">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{product.rating || 0}</span>
                  <span className="text-gray-500">({product.review_count || 0} reviews)</span>
                </div>
                {product.discount > 0 && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text">Price</span>
                  <span className="font-medium text-[#00A7B3]">KSh {product.price}</span>
                </div>
                {product.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-text">Discount</span>
                    <span className="font-medium text-orange-600">{product.discount}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text">Stock Quantity</span>
                  <span className="font-medium">{product.stock_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStockStatus(product.stock_quantity).color}`}>
                    {getStockIcon(product.stock_quantity)}
                    {getStockStatus(product.stock_quantity).text}
                  </span>
                </div>
                {product.weight && (
                  <div className="flex justify-between">
                    <span className="text-text">Weight</span>
                    <span className="font-medium">{product.weight} {product.unit || 'units'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // TODO: Implement edit functionality
                alert('Edit functionality coming soon!');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center gap-2"
              disabled
            >
              <Edit3 className="h-4 w-4" />
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
          <p className="text-text mb-6">There was an error loading the products. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-fresh-secondary">Products</h1>
            <button
              onClick={() => navigate({ to: '/store/create-product' })}
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Stock:</span>
              </div>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as string | 'all')}
                className="border bg-searchbar border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || stockFilter !== 'all' ? 'No Products Found' : 'No Products Yet'}
            </h2>
            <p className="text-text mb-6">
              {searchQuery || stockFilter !== 'all'
                ? "Try adjusting your search or filter criteria."
                : "Add your first product to get started."
              }
            </p>
            {(!searchQuery && stockFilter === 'all') && (
              <button
                onClick={() => navigate({ to: '/store/create-product' })}
                className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product: ProductInStore) => (
              <div
                key={product.product_id}
                className="bg-searchbar border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="lg:p-6 p-2">
                  <div className="flex lg:flex-row flex-col items-start gap-4 mb-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.image_url || 'https://via.placeholder.com/80x80?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-1 right-1 bg-orange-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                          -{product.discount}%
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-fresh-secondary truncate">{product.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStockStatus(product.stock_quantity).color}`}>
                          {getStockIcon(product.stock_quantity)}
                          {getStockStatus(product.stock_quantity).text}
                        </span>
                      </div>

                      <p className="text-text text-sm mb-3 line-clamp-2">{product.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-text">Price</p>
                            <p className="font-bold text-[#00A7B3]">KSh {product.price}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-text">Stock</p>
                            <p className="font-medium">{product.stock_quantity} units</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-text">Rating</p>
                            <p className="font-medium">{product.rating || 0} ({product.review_count || 0})</p>
                          </div>
                        </div>

                        {product.weight && (
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-text">Weight</p>
                              <p className="font-medium">{product.weight} {product.unit || 'units'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="text-[#00A7B3] hover:text-[#00A7B3]/80 flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProduct && (
          <ProductDetailsModal product={selectedProduct} onClose={closeModal} />
        )}
      </div>
    </div>
  );
}