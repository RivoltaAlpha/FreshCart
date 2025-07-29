import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Search, Heart, ChevronDown, ShoppingCart, LocateFixedIcon, Eye, Star, Phone, Mail, MapPin, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { useStoreProducts } from '@/hooks/useProducts'
import { useStores } from '@/hooks/useStore'
import type { Product } from '@/types/types'
import { storeActions } from '@/store/store'
import { cartActions, cartStore } from '@/store/cart'
import { toast } from 'sonner'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

export const Route = createFileRoute('/shop-store')({
  component: RouteComponent,
})

function RouteComponent() {
  const [activeTab, setActiveTab] = useState('Products')
  const [searchQuery, setSearchQuery] = useState('')
  const [showImageOnly, setShowImageOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [cartCount, setCartCount] = useState(0)
  const store = localStorage.getItem('selectedStore')
  const store_id = store ? JSON.parse(store).store_id : null
  const [dietaryOpen, setDietaryOpen] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const { stores } = useStores()
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useStoreProducts(store_id ?? 0)

  // Load cart from storage on component mount and set up cart subscription
  useEffect(() => {
    cartActions.loadFromStorage()
    setCartCount(cartActions.getCartCount())

    // Subscribe to cart changes
    const unsubscribe = cartStore.subscribe(() => {
      setCartCount(cartActions.getCartCount())
    })

    return () => unsubscribe()
  }, [])

  // Refetch products when store_id changes
  useEffect(() => {
    if (store_id) {
      refetch()
    }
  }, [store_id, refetch])

  const filterOptions = [
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'grains', name: 'Grains' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'herbs', name: 'Herbs' },
    { id: 'meat', name: 'Meat' },
    { id: 'bakery', name: 'Bakery' },
    { id: 'legumes', name: 'Legumes' },
    { id: 'spices & seasonings', name: 'Spices & Seasonings' },
  ]

  const currentStore = stores?.find((store) => store.store_id === store_id)

  // Handle store selection
  const handleStoreChange = (storeId: number) => {
    const selectedStore = stores?.find((store) => store.store_id === storeId)
    if (selectedStore) {
      storeActions.saveStore({
        store_id: selectedStore.store_id,
        owner_id: selectedStore.owner_id || 0,
        name: selectedStore.name,
        county: selectedStore.county || '',
        town: selectedStore.town || '',
        contact_info: selectedStore.contact_info || '',
        store_code: selectedStore.store_code || '',
        delivery_fee: selectedStore.delivery_fee || 0,
      })
      toast.success(`Selected ${selectedStore.name}`)
    }
  }

  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // Ensure products is always an array
    const productsArray = Array.isArray(products) ? products : []

    return productsArray
      .filter((product) => {
        // Add null safety checks for product properties
        if (!product || !product.name || !product.category?.name) {
          return false
        }

        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.description && product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
          product.category.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())

        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.some((cat) =>
            product.category.name.toLowerCase().includes(cat),
          )

        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            const priceA =
              typeof a.price === 'string' ? parseFloat(a.price) || 0 : a.price
            const priceB =
              typeof b.price === 'string' ? parseFloat(b.price) || 0 : b.price
            return priceA - priceB
          case 'rating':
            const ratingA =
              typeof a.rating === 'string'
                ? parseFloat(a.rating) || 0
                : a.rating
            const ratingB =
              typeof b.rating === 'string'
                ? parseFloat(b.rating) || 0
                : b.rating
            return ratingB - ratingA
          case 'category':
            return a.category.name.localeCompare(b.category.name)
          case 'name':
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [products, searchQuery, selectedCategories, sortBy])

  // Add to cart function
  const handleAddToCart = (product: Product) => {
    cartActions.addToCart(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleWishlistClick = (product: Product) => {
    toast.success(`${product.name} added to wishlist!`)
  }

  const handleViewDetails = () => {
    if (selectedProduct) {
      navigate({
        to: '/product-details',
        search: {
          productId: selectedProduct.product_id.toString(),
          name: selectedProduct.name,
          price: selectedProduct.price.toString(),
          image: selectedProduct.image_url,
          description: selectedProduct.description || 'Fresh, high-quality product from our local store.',
          category: selectedProduct.category?.name || 'Uncategorized',
          stock: selectedProduct.stock_quantity?.toString() || '0',
          rating: selectedProduct.rating?.toString() || '4.5',
          reviews: selectedProduct.review_count?.toString() || '0',
        },
      })
    }
    setIsModalOpen(false)
  }

  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct)
      setIsModalOpen(false)
    }
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <div
          className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => handleProductClick(product)}
        >
          <img
            src={product.image_url || './market-concept-with-vegetables.jpg'}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
        <button className="absolute top-2 right-2 p-2 bg-card rounded-full shadow hover:bg-red-600 transition-colors">
          <Heart size={16} className=" hover:text-red-500 click:bg-red-500/10 transition-colors"
            onClick={() => handleWishlistClick(product)}
          />
        </button>
        <button
          onClick={() => handleProductClick(product)}
          className="absolute top-2 left-2 p-2 bg-[#189AB4] text-white rounded-full shadow hover:bg-[#05445E] transition-colors"
        >
          <Eye size={16} />
        </button>
        {product.stock_quantity && parseInt(String(product.stock_quantity)) < 10 && (
          <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </div>
        )}
      </div>
      <div className="p-4 space-y-2 flex flex-col">
        <div className="text-sm flex justify-between items-center">
          <h3
            className="text-lg font-semibold cursor-pointer hover:text-[#189AB4] transition-colors"
            onClick={() => handleProductClick(product)}
          >
            {product.name}
          </h3>
          <p>{product.category?.name}</p>
        </div>
        <div className="flex items-center justify-between gap-1 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-500">Stock:</span>
            <span className={`font-semibold ${product.stock_quantity && parseInt(String(product.stock_quantity)) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock_quantity || 'Out of Stock'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-fresh-secondary">{product.rating}</span>
            <span className="text-fresh-secondary">({product.review_count})</span>
          </div>
        </div>
        <div className="font-bold text-fresh-secondary">
          {typeof product.price === 'string' &&
            ((product.price as string)?.includes('Box') || (product.price as string)?.includes('Pack')) ? (
            product.price
          ) : (
            <>KSh {product.price}</>
          )}
        </div>
        <button
          onClick={() => handleAddToCart(product)}
          className="bg-fresh-secondary hover:bg-fresh-secondary/90 px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
          disabled={
            !product.stock_quantity || parseInt(String(product.stock_quantity)) === 0
          }
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  )

  const cartItems = cartStore.state.items
  const total = cartItems.reduce(
    (sum, item) => sum + (typeof item.product.price === 'string' ? parseFloat(item.product.price) || 0 : item.product.price) * item.quantity,
    0,
  )
  const cartCard = (
    <div className="bg-card w-80 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-2">Cart ({cartCount})</h3>
      {cartCount > 0 ? (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div key={item.product.product_id} className="flex items-center justify-between">
              <span className='flex items-center justify-between'>{item.product.name} <p className='bg-fresh-secondary p-1 rounded-full ml-2 shadow-2xl'>{item.quantity}</p></span>
              <span>KSh {typeof item.product.price === 'string' ? parseFloat(item.product.price) || 0 : item.product.price}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 text-right">
            <strong>Total: KSh {total.toFixed(2)}</strong>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Your cart is empty</p>
      )}
      <button
        onClick={() => cartActions.clearCart()}
        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        disabled={cartCount === 0}
      >
        Clear Cart
      </button>
      <div className="mt-4">
        <Link to="/customer/cart" className="flex justify-center w-full bg-fresh-secondary hover:bg-fresh-secondary text-white px-4 py-2 rounded-lg transition-colors">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )

  // Loading Component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#189AB4]" />
      <p className="text-[#05445E] font-medium">Loading products...</p>
      <p className="text-gray-500 text-sm">Please wait while we fetch the latest products</p>
    </div>
  )

  // About Store Content
  const AboutStoreContent = () => {
    if (!currentStore) {
      return (
        <div className="bg-card rounded-lg p-8 text-center">
          <p className="text-gray-500">Please select a store to view details.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Store Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-card rounded-lg p-20 shadow-sm">
            <h3 className="text-xl font-semibold text-[#05445E] mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#189AB4]" />
                <span className="text-gray-700">{currentStore.contact_info}</span>
              </div>
              {currentStore.owner?.profile?.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#189AB4]" />
                  <span className="text-gray-700">{currentStore.owner.profile.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#05445E] mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <LocateFixedIcon className="w-4 h-4 text-[#189AB4]" />
                <span className="text-gray-700">{currentStore.address?.area}, {currentStore.address?.town}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#189AB4]" />
                <span className="text-gray-700">{currentStore.address?.county}, {currentStore.address?.country}</span>
              </div>
            </div>
          </div>

          {/* Store Owner */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#05445E] mb-4">Store Owner</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#189AB4] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentStore.owner?.profile?.first_name?.[0]}{currentStore.owner?.profile?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-[#05445E]">
                  {currentStore.owner?.profile?.first_name} {currentStore.owner?.profile?.last_name}
                </p>
                <p className="text-gray-600 text-sm">{currentStore.owner?.email}</p>
              </div>
            </div>
          </div>

          {/* Store Details */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#05445E] mb-4">Store Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Store Code:</span>
                <span className="font-semibold text-[#05445E]">{currentStore.store_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="font-semibold text-[#05445E]">KSh {currentStore.delivery_fee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Policies */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-[#05445E] mb-4">Store Policies</h3>
          <div className="space-y-3 text-gray-700">
            <p>• We ensure all products are fresh and of the highest quality</p>
            <p>• Delivery is available within {currentStore.address?.county} with a standard fee of KSh {currentStore.delivery_fee}</p>
            <p>• We accept returns within 24 hours for perishable goods if they don't meet quality standards</p>
            <p>• Customer satisfaction is our top priority</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Banner */}
        <div className="h-64 w-full relative overflow-hidden">
          <img
            src={currentStore?.image_url || "./market-concept-with-vegetables.jpg"}
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
          <div className="flex-col absolute inset-0 bg-black/50 w-full h-full object-cover">
            <div className='flex items-center justify-center my-20 flex-col'>
              <h1 className="text-5xl font-bold text-white">
                {currentStore?.name} 🌱
              </h1>
            </div>
          </div>
        </div>

        {/* Store Header */}
        <div className="bg-card shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center gap-6">
            <img
              src={currentStore?.image_url || "/market-concept-with-vegetables.jpg"}
              alt="Store Logo"
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold ">
                {currentStore?.name} 🌱
              </h1>
              <p className="text-fresh-secondary">{currentStore?.address?.county}</p>
              <div className="mt-2 flex flex-col sm:flex-row gap-2 text-sm text-fresh-secondary">
                <span><LocateFixedIcon className="inline-block w-4 h-4 mr-1" /> {currentStore?.address?.town} town</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative cursor-pointer" onClick={() => navigate({ to: '/customer/cart' })}>
                <ShoppingCart className="w-8 h-8 text-fresh-secondary" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="w-20 h-20 bg-[#189AB4] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {currentStore?.owner?.profile?.first_name?.[0]}{currentStore?.owner?.profile?.last_name?.[0]}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="flex items-center gap-1">
              <p className="text-[#189AB4] text-lg">{currentStore?.description}</p>
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-semibold text-[#05445E]">{parseFloat((currentStore?.rating ?? '0').toString()).toFixed(1)}</span>
              <span className="text-gray-500">({currentStore?.total_reviews || 0} reviews)</span>
              <span className="text-sm font-medium flex items-center gap-1">
                {currentStore?.is_verified && (
                  <Shield className="w-4 h-4" />
                )}
                Verified Store
              </span>
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-card border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-8">
              {['Products', 'About Store'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium ${activeTab === tab
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
        <div className="max-w-8xl mx-20 px-4 py-6">
          {activeTab === 'Products' ? (
            <div className="flex flex-col lg:flex-row gap-6 bg-search justify-center">
              {/* Sidebar */}
              <div className="hidden lg:block w-64 space-y-6">
                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-fresh-secondary" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-500 mt-2 hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-2">Select Store</h3>
                  <select
                    value={store_id ?? ''}
                    onChange={(e) => handleStoreChange(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a store...</option>
                    {stores?.map((store) => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.name} - {store.county}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-card rounded-lg p-4 shadow-sm">
                  <button
                    onClick={() => setDietaryOpen(!dietaryOpen)}
                    className="flex items-center justify-between w-full text-left font-medium"
                  >
                    Product Categories
                    <ChevronDown
                      size={16}
                      className={`transform transition-transform ${dietaryOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {dietaryOpen && (
                    <div className="mt-4 space-y-2">
                      {filterOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(option.id)}
                            onChange={() => handleCategoryFilter(option.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>
                            {option.name}
                          </span>
                        </label>
                      ))}
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={() => setSelectedCategories([])}
                          className="text-blue-500 text-sm hover:underline mt-2"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1 max-w-7xl">
                {/* Mobile Search */}
                <div className="lg:hidden mb-4">
                  <div className="bg-card rounded-lg p-4 shadow-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-fresh-secondary" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {!isLoading && (
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                    <span className="text-fresh-secondary">
                      Show all products ({filteredProducts.length})
                      {selectedCategories.length > 0 && (
                        <span className="ml-2 text-blue-600">
                          • {selectedCategories.length} filter
                          {selectedCategories.length > 1 ? 's' : ''} applied
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showImageOnly}
                          onChange={(e) => setShowImageOnly(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span>Show image only</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-fresh-secondary">Sort by:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1"
                        >
                          <option value="name">Name A-Z</option>
                          <option value="price">Price Low to High</option>
                          <option value="rating">Highest Rated</option>
                          <option value="category">Category</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    <div className="col-span-full">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="col-span-full text-center py-8 text-red-500">
                      Error loading products: {error?.message || 'Unknown error occurred'}
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard key={product.product_id} product={product} />
                    ))
                  ) : (
                    <div className="col-span-full">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="hidden lg:block w-64">
                <div className="sticky top-6">
                  {cartCount > 0 ? (
                    cartCard
                  ) : (
                    <div className="bg-card rounded-lg shadow-sm p-4 text-center">
                      <p className="text-gray-500">Your cart is empty</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <AboutStoreContent />
          )}
        </div>
      </div>

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogClose onClick={() => setIsModalOpen(false)} />
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#05445E]">
                  {selectedProduct.name}
                </DialogTitle>
                <DialogDescription className="text-[#189AB4] text-lg">
                  {selectedProduct.category?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Product Image */}
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={selectedProduct.image_url || './market-concept-with-vegetables.jpg'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-[#189AB4]">
                    {typeof selectedProduct.price === 'string' &&
                      ((selectedProduct.price as string)?.includes('Box') ||
                        (selectedProduct.price as string)?.includes('Pack')) ? (
                      selectedProduct.price
                    ) : (
                      <>KSh {selectedProduct.price}</>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-[#05445E] ml-1">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-gray-500">({selectedProduct.review_count} reviews)</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedProduct.stock_quantity && parseInt(String(selectedProduct.stock_quantity)) > 10
                      ? 'bg-green-500'
                      : selectedProduct.stock_quantity && parseInt(String(selectedProduct.stock_quantity)) > 0
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`} />
                    <span className="text-[#05445E]">
                      {selectedProduct.stock_quantity && parseInt(String(selectedProduct.stock_quantity)) > 10
                        ? 'In Stock'
                        : selectedProduct.stock_quantity && parseInt(String(selectedProduct.stock_quantity)) > 0
                          ? 'Low Stock'
                          : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500">({selectedProduct.stock_quantity} available)</span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#05445E]">Description</h4>
                    <p className="text-gray-600 text-sm">
                      {selectedProduct.description || 'Fresh, high-quality product from our local store.'}
                    </p>
                  </div>

                  {/* Store Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-[#05445E] mb-2">Store Information</h4>
                    <p className="text-sm text-gray-600">
                      Available at {currentStore?.name || 'Store'} in {currentStore?.address?.county}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddToCartFromModal}
                  disabled={!selectedProduct.stock_quantity || parseInt(String(selectedProduct.stock_quantity)) === 0}
                  className="flex-1 bg-[#189AB4] hover:bg-[#75E6DA] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  onClick={handleViewDetails}
                  className="flex-1 bg-[#05445E] hover:bg-[#189AB4] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={20} />
                  View Full Details
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  )
}