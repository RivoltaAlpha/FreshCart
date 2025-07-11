import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import {
  Package,
  ArrowLeft,
  DollarSign,
  BarChart3,
  TrendingUp,
  Image as ImageIcon,
  Star,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCreateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategory';
import { useStoreInventoryProducts, useAddProductToInventory } from '@/hooks/useInventory';

export const Route = createFileRoute('/store/create-product')({
  component: RouteComponent,
})

function RouteComponent() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    category_id: 0,
    inventory_id: 0,
    image_url: '',
    weight: 0,
    unit: '',
    rating: 5.0,
    review_count: 0,
    discount: 0,
    initial_quantity: 0,
    reorder_level: 5,
    cost_price: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');

  const storeId = 2; // Replace with actual store ID or fetch dynamically
  const createProductMutation = useCreateProduct();
  const addProductToInventoryMutation = useAddProductToInventory();
  const { data: Categories, isLoading, isError } = useCategories();
  const { data: storeInventories, isLoading: inventoriesLoading, isError: inventoriesError } = useStoreInventoryProducts(storeId);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'category_id' || name === 'inventory_id' ?
        (value === '' ? 0 : parseInt(value) || 0) :
        ['price', 'weight', 'rating', 'cost_price'].includes(name) ?
          (value === '' ? 0 : parseFloat(value) || 0) :
          ['stock_quantity', 'review_count', 'discount', 'initial_quantity', 'reorder_level'].includes(name) ?
            (value === '' ? 0 : parseInt(value) || 0) :
            value || '',
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');

  // Cloudinary configuration - replace with your actual values
  const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dvs1ubd5c';
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'freshcart';

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    formData.append('folder', 'freshcart/products');

    try {
      setUploadProgress(10);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `Upload failed: ${response.statusText}`;

        // Special handling for upload preset errors
        if (errorMessage.includes('upload preset') || errorMessage.includes('preset')) {
          throw new Error('Upload preset not found. Please check your Cloudinary configuration or create an unsigned upload preset.');
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setUploadProgress(100);

      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadProgress(0);

    try {
      // For immediate preview, read file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(file);

      // Update form with Cloudinary URL
      setForm(prev => ({ ...prev, image_url: cloudinaryUrl }));
      setUploadProgress(100);

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.description.trim()) newErrors.description = 'Product description is required';
    if (!form.category_id || form.category_id === 0) newErrors.category_id = 'Please select a category';
    if (!form.inventory_id || form.inventory_id === 0) newErrors.inventory_id = 'Please select an inventory';
    if (!form.price || form.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!form.cost_price || form.cost_price <= 0) newErrors.cost_price = 'Cost price must be greater than 0';
    if (form.price <= form.cost_price) newErrors.price = 'Selling price must be higher than cost price';
    if (!form.weight || form.weight <= 0) newErrors.weight = 'Weight must be greater than 0';
    if (!form.unit.trim()) newErrors.unit = 'Unit is required';
    if (!form.stock_quantity || form.stock_quantity < 0) newErrors.stock_quantity = 'Stock quantity must be 0 or greater';
    if (!form.initial_quantity || form.initial_quantity < 0) newErrors.initial_quantity = 'Initial quantity must be 0 or greater';
    if (!form.reorder_level || form.reorder_level < 0) newErrors.reorder_level = 'Reorder level must be 0 or greater';
    if (form.discount < 0 || form.discount > 100) newErrors.discount = 'Discount must be between 0 and 100';
    if (form.rating < 1 || form.rating > 5) newErrors.rating = 'Rating must be between 1 and 5';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // First, create the product
      const createdProduct = await createProductMutation.mutateAsync({
        name: form.name,
        store_id: storeId,
        description: form.description,
        price: form.price,
        stock_quantity: form.stock_quantity,
        category_id: form.category_id,
        image_url: form.image_url,
        weight: form.weight,
        unit: form.unit,
        rating: form.rating,
        review_count: form.review_count,
        discount: form.discount,
        initial_quantity: form.initial_quantity,
        reorder_level: form.reorder_level,
      });

      // Then, add the product to the selected inventory
      if (createdProduct && createdProduct.product_id && form.inventory_id) {
        await addProductToInventoryMutation.mutateAsync({
          inventory_id: form.inventory_id,
          product_id: createdProduct.product_id
        });
      }

      setShowSuccess(true);

      // Redirect after showing success message
      setTimeout(() => {
        navigate({ to: '/store/products' });
      }, 2000);
    } catch (error) {
      console.error('Error creating product or adding to inventory:', error);
    }
  };

  useEffect(() => {
    if (createProductMutation.isSuccess) {
      setShowSuccess(true);
    }
  }, [createProductMutation.isSuccess]);

  const profitMargin = (form.price || 0) > 0 && (form.cost_price || 0) > 0 ?
    (((form.price || 0) - (form.cost_price || 0)) / (form.price || 0)) * 100 : 0;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Created!</h2>
          <p className="text-gray-600 mb-6">Your product has been successfully created and added to the selected inventory.</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A7B3] mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting to products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/store/products' })}
            className="flex items-center gap-2 text-[#00A7B3] hover:text-[#00A7B3]/80 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
          <p className="text-gray-600 mt-2">Add a new product to your store</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name || ''}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter product name"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category_id"
                        value={form.category_id || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.category_id ? 'border-red-300' : 'border-gray-300'
                          }`}
                        disabled={isLoading}
                      >
                        <option value={0}>
                          {isLoading ? 'Loading categories...' : 'Select a category'}
                        </option>
                        {Categories?.map((category) => (
                          <option key={category.category_id} value={category.category_id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                      {isError && <p className="mt-1 text-sm text-red-600">Failed to load categories</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inventory *
                      </label>
                      <select
                        name="inventory_id"
                        value={form.inventory_id || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.inventory_id ? 'border-red-300' : 'border-gray-300'
                          }`}
                        disabled={inventoriesLoading}
                      >
                        <option value={0}>
                          {inventoriesLoading ? 'Loading inventories...' : 'Select an inventory'}
                        </option>
                        {storeInventories?.map((inventory) => (
                          <option key={inventory.inventory_id} value={inventory.inventory_id}>
                            Inventory #{inventory.inventory_id} - Store ID: {inventory.store_id}
                          </option>
                        ))}
                      </select>
                      {errors.inventory_id && <p className="mt-1 text-sm text-red-600">{errors.inventory_id}</p>}
                      {inventoriesError && <p className="mt-1 text-sm text-red-600">Failed to load inventories</p>}
                      <p className="mt-1 text-xs text-gray-500">
                        The product will be automatically added to the selected inventory
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={form.description || ''}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Enter product description"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cost Price (KSh) *
                      </label>
                      <input
                        type="number"
                        name="cost_price"
                        value={form.cost_price || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.cost_price ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter cost price"
                        min="0"
                        step="0.01"
                      />
                      {errors.cost_price && <p className="mt-1 text-sm text-red-600">{errors.cost_price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price (KSh) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={form.price || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.price ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter selling price"
                        min="0"
                        step="0.01"
                      />
                      {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={form.discount || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.discount ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter discount"
                        min="0"
                        max="100"
                      />
                      {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
                    </div>
                  </div>

                  {/* Profit Margin Display */}
                  {(form.price || 0) > 0 && (form.cost_price || 0) > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>Profit Margin:</strong> KSh {((form.price || 0) - (form.cost_price || 0)).toFixed(2)} ({profitMargin.toFixed(1)}%)
                      </p>
                    </div>
                  )}
                </div>

                {/* Physical Properties */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Physical Properties
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight *
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={form.weight || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.weight ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter weight"
                        min="0"
                        step="0.01"
                      />
                      {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit *
                      </label>
                      <input
                        type="text"
                        name="unit"
                        value={form.unit || ''}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.unit ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="e.g., per kg, per piece, per bunch"
                      />
                      {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Inventory Management
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Initial Quantity *
                      </label>
                      <input
                        type="number"
                        name="initial_quantity"
                        value={form.initial_quantity || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.initial_quantity ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter initial quantity"
                        min="0"
                      />
                      {errors.initial_quantity && <p className="mt-1 text-sm text-red-600">{errors.initial_quantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock_quantity"
                        value={form.stock_quantity || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.stock_quantity ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter current stock"
                        min="0"
                      />
                      {errors.stock_quantity && <p className="mt-1 text-sm text-red-600">{errors.stock_quantity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reorder Level *
                      </label>
                      <input
                        type="number"
                        name="reorder_level"
                        value={form.reorder_level || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.reorder_level ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter reorder level"
                        min="0"
                      />
                      {errors.reorder_level && <p className="mt-1 text-sm text-red-600">{errors.reorder_level}</p>}
                    </div>
                  </div>

                  {/* Low Stock Warning */}
                  {(form.stock_quantity || 0) > 0 && (form.reorder_level || 0) > 0 && (form.stock_quantity || 0) <= (form.reorder_level || 0) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          <strong>Warning:</strong> Stock quantity is at or below the reorder level.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Product Rating
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={form.rating || 0}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent ${errors.rating ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="Enter rating"
                        min="1"
                        max="5"
                        step="0.1"
                      />
                      {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Count
                      </label>
                      <input
                        type="number"
                        name="review_count"
                        value={form.review_count || 0}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                        placeholder="Enter review count"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => navigate({ to: '/store/products' })}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProductMutation.isPending || addProductToInventoryMutation.isPending}
                    className="px-6 py-2 bg-[#00A7B3] text-white rounded-lg hover:bg-[#00A7B3]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {(createProductMutation.isPending || addProductToInventoryMutation.isPending) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {createProductMutation.isPending ? 'Creating Product...' :
                      addProductToInventoryMutation.isPending ? 'Adding to Inventory...' :
                        'Create Product'}
                  </button>
                </div>

                {/* Error Display */}
                {(createProductMutation.isError || addProductToInventoryMutation.isError) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600">
                      <strong>Error:</strong> {
                        createProductMutation.isError
                          ? (createProductMutation.error as Error)?.message || 'Failed to create product'
                          : (addProductToInventoryMutation.error as Error)?.message || 'Failed to add product to inventory'
                      }
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Product Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Preview</h3>

              {/* Image Upload/URL Section */}
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageMethod('url')}
                    className={`px-3 py-1 text-xs rounded ${imageMethod === 'url'
                      ? 'bg-[#00A7B3] text-white'
                      : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    Image URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMethod('upload')}
                    className={`px-3 py-1 text-xs rounded ${imageMethod === 'upload'
                      ? 'bg-[#00A7B3] text-white'
                      : 'bg-gray-200 text-gray-700'
                      }`}
                  >
                    Upload Image
                  </button>
                </div>

                {imageMethod === 'url' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="h-4 w-4 inline mr-1" />
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image_url"
                      value={form.image_url || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                      placeholder="Enter image URL"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="h-4 w-4 inline mr-1" />
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Uploading...</span>
                          <span className="text-xs text-gray-600">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#00A7B3] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Upload Error */}
                    {uploadError && (
                      <div className="mt-2 flex items-center text-red-600 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {uploadError}
                      </div>
                    )}

                    {/* Upload Success */}
                    {!isUploading && form.image_url && form.image_url.includes('cloudinary') && (
                      <div className="mt-2 flex items-center text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Image uploaded successfully
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, WebP (max 5MB)
                    </p>
                  </div>
                )}

                {/* Image Preview */}
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Product preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200x128?text=No+Image';
                    }}
                  />
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {form.name || 'Product Name'}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {form.description || 'Product description will appear here...'}
                  </p>
                </div>

                {(form.price || 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-[#00A7B3]">
                        KSh {(form.price || 0).toFixed(2)}
                      </p>
                      {(form.discount || 0) > 0 && (
                        <p className="text-sm text-orange-600">
                          {form.discount || 0}% off
                        </p>
                      )}
                    </div>
                    {(form.rating || 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{form.rating || 0}</span>
                      </div>
                    )}
                  </div>
                )}

                {((form.weight || 0) > 0 || (form.unit || '').trim()) && (
                  <div className="text-sm text-gray-600">
                    <p>Weight: {form.weight || 0} {form.unit || 'units'}</p>
                  </div>
                )}

                {(form.stock_quantity || 0) > 0 && (
                  <div className="text-sm text-gray-600">
                    <p>In Stock: {form.stock_quantity || 0} available</p>
                    {(form.inventory_id || 0) > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Will be added to Inventory #{form.inventory_id}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}