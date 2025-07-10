import { createFileRoute, useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react';
import {
  Package,
  Eye,
  Plus,
  XCircle,
  ShoppingBag,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import type { InventoryProducts, ProductItem } from '@/types/store';
import { useStoreInventoryProducts } from '@/hooks/useInventory';

export const Route = createFileRoute('/store/inventories')({
  component: RouteComponent,
})

function RouteComponent() {
  const store_id = 2;
  const { data: inventory, isLoading, isError } = useStoreInventoryProducts(store_id);
  const [selectedInventory, setSelectedInventory] = useState<InventoryProducts | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const navigate = useNavigate();

  console.log("Inventory Data:", inventory);

  const inventories = React.useMemo(() => {
    // Handle case where inventory might be wrapped in an object or be an array directly
    let inventoriesArray: InventoryProducts[] = [];

    if (Array.isArray(inventory)) {
      inventoriesArray = inventory.map((inv: any) => ({
        store_id: inv.store_id ?? 0,
        inventory_id: inv.inventory_id ?? 0,
        stock_qty: inv.stock_qty ?? 0,
        reorder_level: inv.reorder_level ?? 0,
        max_stock_level: inv.max_stock_level ?? 0,
        cost_price: inv.cost_price ?? "0",
        last_restocked: inv.last_restocked ?? new Date().toISOString(),
        created_at: inv.created_at ?? "",
        updated_at: inv.updated_at ?? "",
        products: inv.products || [],
        ...inv
      }));
    } else if (inventory && typeof inventory === 'object' && 'inventories' in inventory) {
      inventoriesArray = ((inventory as any).inventories || []).map((inv: any) => ({
        store_id: inv.store_id ?? 0,
        inventory_id: inv.inventory_id ?? 0,
        stock_qty: inv.stock_qty ?? 0,
        reorder_level: inv.reorder_level ?? 0,
        max_stock_level: inv.max_stock_level ?? 0,
        cost_price: inv.cost_price ?? "0",
        last_restocked: inv.last_restocked ?? new Date().toISOString(),
        created_at: inv.created_at ?? "",
        updated_at: inv.updated_at ?? "",
        products: inv.products || [],
        ...inv
      }));
    } else if (inventory && typeof inventory === 'object' && 'data' in inventory) {
      inventoriesArray = ((inventory as any).data || []).map((inv: any) => ({
        store_id: inv.store_id ?? 0,
        inventory_id: inv.inventory_id ?? 0,
        stock_qty: inv.stock_qty ?? 0,
        reorder_level: inv.reorder_level ?? 0,
        max_stock_level: inv.max_stock_level ?? 0,
        cost_price: inv.cost_price ?? "0",
        last_restocked: inv.last_restocked ?? new Date().toISOString(),
        created_at: inv.created_at ?? "",
        updated_at: inv.updated_at ?? "",
        products: inv.products || [],
        ...inv
      }));
    }

    return inventoriesArray;
  }, [inventory]);

  // Filter inventories based on stock levels
  const filteredInventories = inventories.filter((inv) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'out_of_stock') return inv.stock_qty <= 0;
    if (statusFilter === 'low_stock') return inv.stock_qty > 0 && inv.stock_qty <= inv.reorder_level;
    if (statusFilter === 'in_stock') return inv.stock_qty > inv.reorder_level;
    return true;
  });

  const openModal = (inventory: InventoryProducts) => {
    setSelectedInventory(inventory);
  };

  const closeModal = () => {
    setSelectedInventory(null);
  };

  const getStockStatus = (stockQty: number, reorderLevel: number) => {
    if (stockQty <= 0) return {
      status: 'Out of Stock',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="h-4 w-4" />
    };
    if (stockQty <= reorderLevel) return {
      status: 'Low Stock',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <AlertTriangle className="h-4 w-4" />
    };
    return {
      status: 'In Stock',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="h-4 w-4" />
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Inventory Products Modal Component
  const InventoryProductsModal = ({ inventory, onClose }: { inventory: InventoryProducts, onClose: () => void }) => {
    const stockStatus = getStockStatus(inventory.stock_qty, inventory.reorder_level);

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">Inventory Products</h2>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${stockStatus.color}`}>
                  {stockStatus.icon}
                  {stockStatus.status}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Inventory Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Inventory ID</p>
                    <p className="font-semibold">#{inventory.inventory_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Stock Quantity</p>
                    <p className="font-semibold">{inventory.stock_qty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Reorder Level</p>
                    <p className="font-semibold">{inventory.reorder_level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Last Restocked</p>
                    <p className="font-semibold">{formatDate(inventory.last_restocked)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-sm text-gray-600">
                <span>Max Stock: {inventory.max_stock_level}</span>
                <span>•</span>
                <span>Cost Price: KSh {typeof inventory.cost_price === 'string' ? parseFloat(inventory.cost_price).toFixed(2) : inventory.cost_price.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate({ to: '/store/create-product' })}
                className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            {/* Products List */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Products ({inventory.products?.length || 0})
              </h3>
              {inventory.products && inventory.products.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inventory.products.map((product: Partial<ProductItem>, index: number) => (
                    <div key={product.product_id || index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/48x48?text=No+Image'}
                          alt={product.name || 'Product'}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Image';
                          }}
                        />
                        <div>
                          <p className="font-medium">{product.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-600">{product.description || 'No description'}</p>
                          <p className="text-sm text-gray-500">Stock: {product.stock_quantity || 0} {product.unit || 'units'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#00A7B3]">KSh {product.price ? parseFloat(product.price.toString()).toFixed(2) : '0.00'}</p>
                        <p className="text-sm text-gray-600">Rating: {product.rating || 0}/5</p>
                        {product.discount && product.discount > 0 && (
                          <p className="text-sm text-orange-600">{product.discount}% off</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No products found in this inventory</p>
                  <button
                    onClick={() => navigate({ to: '/store/create-product' })}
                    className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add First Product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Inventories</h1>
          <p className="text-gray-600 mb-6">There was an error loading the inventories. Please try again.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Store Inventories</h1>
            <button
              onClick={() => navigate({ to: '/store/create-inventory' })}
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Add Inventory
            </button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by stock:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
            >
              <option value="all">All Inventories</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Inventories List */}
        {filteredInventories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No Inventories Yet' : `No ${statusFilter.replace('_', ' ')} Inventories`}
            </h2>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all'
                ? "No inventories have been created yet."
                : `No inventories matching the ${statusFilter.replace('_', ' ')} filter.`
              }
            </p>
            <button
              onClick={() => navigate({ to: '/store/create-inventory' })}
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Create First Inventory
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInventories.map((inventory: InventoryProducts) => {
              const stockStatus = getStockStatus(inventory.stock_qty, inventory.reorder_level);
              return (
                <div
                  key={inventory.inventory_id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">Inventory #{inventory.inventory_id}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${stockStatus.color}`}>
                          {stockStatus.icon}
                          {stockStatus.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(inventory)}
                          className="bg-[#1c16d2] text-white p-2 rounded hover:text-[#00A7B3]/80 flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View Products
                        </button>
                        <button
                          onClick={() => navigate({ to: '/store/create-product' })}
                          className="bg-[#1c16d2] text-white p-2 rounded hover:text-green-700 flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Products</p>
                          <p className="font-medium">{inventory.products?.length || 0} items</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Stock Quantity</p>
                          <p className="font-medium">{inventory.stock_qty}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Cost Price</p>
                          <p className="font-medium text-[#00A7B3]">KSh {typeof inventory.cost_price === 'string' ? parseFloat(inventory.cost_price).toFixed(2) : inventory.cost_price.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Last Restocked</p>
                          <p className="font-medium">{formatDate(inventory.last_restocked)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Reorder Level: {inventory.reorder_level}</span>
                      <span>Max Stock: {inventory.max_stock_level}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Inventory Products Modal */}
        {selectedInventory && (
          <InventoryProductsModal
            inventory={selectedInventory}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}
