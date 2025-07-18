import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { useStoreInventoryProducts, useUpdateInventoryStock } from '@/hooks/useInventory'

export const Route = createFileRoute('/store/stock-management')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = localStorage.getItem("currentStore") || '';
  const storeId = store ? JSON.parse(store).store_id : 0;
  const { data: inventory, isLoading, isError } = useStoreInventoryProducts(storeId);
  const [editId, setEditId] = useState<number | null>(null)
  const [newStock, setNewStock] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const updateStockMutation = useUpdateInventoryStock()

  useEffect(() => {
    if (updateStockMutation.isSuccess) {
      setSuccessMsg('Stock updated successfully!')
      setEditId(null)
      setNewStock('')
      setErrorMsg('')
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMsg('')
      }, 3000);
    }
  }, [updateStockMutation.isSuccess]);

  useEffect(() => {
    if (updateStockMutation.isError) {
      setErrorMsg(updateStockMutation.error?.message || 'Failed to update stock')
      setSuccessMsg('')
    }
  }, [updateStockMutation.isError, updateStockMutation.error]);

  const handleEdit = (inventory_id: number, currentStock: number) => {
    setEditId(inventory_id)
    setNewStock(String(currentStock))
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleCancel = () => {
    setEditId(null)
    setNewStock('')
    setSuccessMsg('')
    setErrorMsg('')
  }

  const handleSave = async () => {
    if (!newStock || Number(newStock) < 0) {
      setErrorMsg('Please enter a valid stock quantity')
      return
    }

    if (!editId) {
      setErrorMsg('No inventory selected for update')
      return
    }

    try {
      setErrorMsg('')
      await updateStockMutation.mutateAsync({
        inventory_id: editId,
        stock_qty: Number(newStock)
      })
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update stock')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-[#189AB4] mx-auto mb-4" />
          <p className="text-[#05445E] text-lg">Loading inventory data...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Failed to load inventories</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#189AB4] hover:bg-[#05445E] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#05445E] mb-4">Stock Management</h1>
          <div className="w-24 h-1 bg-[#189AB4] mb-4"></div>
          <p className="text-lg text-gray-600">Manage your inventory stock levels</p>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">✅</span>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center">
            <span className="mr-2">❌</span>
            {errorMsg}
          </div>
        )}

        {/* Stock Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {inventory && inventory.length > 0 ? (
            inventory.map((inv) => {
              const isLowStock = inv.stock_qty <= (inv.reorder_level || 10)
              const isOutOfStock = inv.stock_qty === 0

              return (
                <div key={inv.inventory_id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#05445E] mb-1">
                        Inventory #{inv.inventory_id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {inv.products && inv.products.length > 0
                          ? inv.products.map(p => p.name).join(', ')
                          : 'No Products'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="inline-flex px-4 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex px-4 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-4 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Information */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Current Stock:</span>
                      {editId === inv.inventory_id ? (
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-1 w-20 focus:outline-none focus:ring-2 focus:ring-[#189AB4] focus:border-transparent text-sm"
                          min="0"
                          placeholder="0"
                        />
                      ) : (
                        <span className={`font-semibold text-lg ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>
                          {inv.stock_qty}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Reorder Level:</span>
                      <span className="text-sm text-gray-800">{inv.reorder_level || 'Not set'}</span>
                    </div>

                    {inv.cost_price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Cost Price:</span>
                        <span className="text-sm text-gray-800">KSh {inv.cost_price}</span>
                      </div>
                    )}

                    {inv.last_restocked && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Last Restocked:</span>
                        <span className="text-sm text-gray-800">{new Date(inv.last_restocked).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {editId === inv.inventory_id ? (
                      <>
                        <button
                          className="flex-1 bg-[#75E6DA] hover:bg-[#189AB4] text-[#05445E] hover:text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleSave}
                          disabled={updateStockMutation.isPending}
                        >
                          {updateStockMutation.isPending ? (
                            <div className="flex items-center justify-center">
                              <Loader className="animate-spin h-4 w-4" />
                            </div>
                          ) : (
                            'Save'
                          )}
                        </button>
                        <button
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                          onClick={handleCancel}
                          disabled={updateStockMutation.isPending}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="w-full bg-[#189AB4] hover:bg-[#05445E] text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        onClick={() => handleEdit(inv.inventory_id, inv.stock_qty)}
                      >
                        Edit Stock
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No inventory items found</h3>
              <p className="text-gray-500">Add products to your inventory to get started</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {inventory && inventory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-[#05445E]">{inventory.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-lg">⚠️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {inventory.filter(inv => inv.stock_qty <= (inv.reorder_level || 10) && inv.stock_qty > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">🚫</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {inventory.filter(inv => inv.stock_qty === 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}