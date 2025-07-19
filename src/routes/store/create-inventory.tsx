import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Package,
  ArrowLeft,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { useCreateInventory } from '@/hooks/useInventory'
import { useProducts } from '@/hooks/useProducts'
import type { CreateInventory, Product } from '@/types/types'

export const Route = createFileRoute('/store/create-inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const createInventoryMutation = useCreateInventory()
  const { data: productsData, isLoading: productsLoading } = useProducts()

  const [formData, setFormData] = useState<CreateInventory>({
    store_id: 2, // Replace with actual store ID
    product_id: 0,
    stock_qty: 0,
    reserved_qty: 0,
    reorder_level: 10,
    cost_price: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  const products = productsData?.products || []

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'product_id' || name === 'store_id' ? parseInt(value) :
        name === 'cost_price' ? parseFloat(value) || 0 :
          parseInt(value) || 0
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.product_id || formData.product_id === 0) {
      newErrors.product_id = 'Please select a product'
    }
    if (!formData.stock_qty || formData.stock_qty < 0) {
      newErrors.stock_qty = 'Stock quantity must be a positive number'
    }
    if ((formData.reserved_qty ?? 0) < 0) {
      newErrors.reserved_qty = 'Reserved quantity cannot be negative'
    }
    if (!formData.reorder_level || formData.reorder_level < 0) {
      newErrors.reorder_level = 'Reorder level must be a positive number'
    }
    if (!formData.cost_price || formData.cost_price <= 0) {
      newErrors.cost_price = 'Cost price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await createInventoryMutation.mutateAsync(formData)
      setShowSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        navigate({ to: '/store/inventories' })
      }, 2000)
    } catch (error) {
      console.error('Error creating inventory:', error)
    }
  }

  const selectedProduct = products.find((p: Product) => p.product_id === formData.product_id)

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Created!</h2>
          <p className="text-gray-600 mb-6">Your inventory has been successfully created.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A7B3] mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting to inventories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/store/inventories' })}
            className="flex items-center gap-2 text-[#00A7B3] hover:text-[#00A7B3]/80 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Inventories
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Inventory</h1>
          <p className="text-gray-600 mt-2">Add a new product to your store's inventory</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="h-4 w-4 inline mr-1" />
                    Select Product *
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.product_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    disabled={productsLoading}
                  >
                    <option value={0}>
                      {productsLoading ? 'Loading products...' : 'Select a product'}
                    </option>
                    {products.map((product: Product) => (
                      <option key={product.product_id} value={product.product_id}>
                        {product.name} - KSh {product.price}
                      </option>
                    ))}
                  </select>
                  {errors.product_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.product_id}</p>
                  )}
                </div>

                {/* Stock Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BarChart3 className="h-4 w-4 inline mr-1" />
                      Initial Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock_qty"
                      value={formData.stock_qty}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.stock_qty ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter stock quantity"
                      min="0"
                    />
                    {errors.stock_qty && (
                      <p className="mt-1 text-sm text-red-600">{errors.stock_qty}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reserved Quantity
                    </label>
                    <input
                      type="number"
                      name="reserved_qty"
                      value={formData.reserved_qty ?? 0}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.reserved_qty ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter reserved quantity"
                      min="0"
                    />
                    {errors.reserved_qty && (
                      <p className="mt-1 text-sm text-red-600">{errors.reserved_qty}</p>
                    )}
                  </div>
                </div>

                {/* Reorder Level and Cost Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <TrendingUp className="h-4 w-4 inline mr-1" />
                      Reorder Level *
                    </label>
                    <input
                      type="number"
                      name="reorder_level"
                      value={formData.reorder_level ?? 10}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.reorder_level ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter reorder level"
                      min="0"
                    />
                    {errors.reorder_level && (
                      <p className="mt-1 text-sm text-red-600">{errors.reorder_level}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      System will alert when stock falls below this level
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Cost Price (KSh) *
                    </label>
                    <input
                      type="number"
                      name="cost_price"
                      value={formData.cost_price ?? 0}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.cost_price ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter cost price"
                      min="0"
                      step="0.01"
                    />
                    {errors.cost_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.cost_price}</p>
                    )}
                  </div>
                </div>

                {/* Warning for Low Stock */}
                {formData.stock_qty > 0 && (formData.reorder_level ?? 0) > 0 && formData.stock_qty <= (formData.reorder_level ?? 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        <strong>Warning:</strong> Initial stock quantity is at or below the reorder level.
                        Consider increasing the stock quantity or adjusting the reorder level.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/store/inventories' })}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createInventoryMutation.isPending}
                    className="px-6 py-2 bg-[#00A7B3] text-white rounded-lg hover:bg-[#00A7B3]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {createInventoryMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {createInventoryMutation.isPending ? 'Creating...' : 'Create Inventory'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Product Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Preview</h3>

              {selectedProduct ? (
                <div className="space-y-4">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200x128?text=No+Image'
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Selling Price</p>
                      <p className="font-medium text-[#00A7B3]">KSh {selectedProduct.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Category</p>
                      <p className="font-medium">{selectedProduct.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <p className="font-medium">{selectedProduct.rating}/5</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reviews</p>
                      <p className="font-medium">{selectedProduct.review_count}</p>
                    </div>
                  </div>

                  {(formData.cost_price ?? 0) > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                      <p className="font-medium text-green-600">
                        KSh {(parseFloat(selectedProduct.price.toString()) - (formData.cost_price ?? 0)).toFixed(2)}
                        ({(((parseFloat(selectedProduct.price.toString()) - (formData.cost_price ?? 0)) / parseFloat(selectedProduct.price.toString())) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a product to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
