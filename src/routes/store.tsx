import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Heart, ChevronDown, ShoppingCart, LocateFixedIcon } from 'lucide-react'
import { useStoreProducts } from '@/hooks/useProducts'
import { useStore } from '@/hooks/useStore'
import type { Product } from '@/types/types'
import { storesStore, storeActions } from '@/store/store'
import { cartActions, cartStore } from '@/store/cart'
import { toast } from 'sonner'

export const Route = createFileRoute('/store')({
  component: StoreLayout,
})

function StoreLayout() {
  const [activeTab, setActiveTab] = useState('Products')
  const [searchQuery, setSearchQuery] = useState('')
  const [showImageOnly, setShowImageOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [cartCount, setCartCount] = useState(0)
  const store_id = storesStore.state.store_id
  const [dietaryOpen, setDietaryOpen] = useState(true)

  const { stores } = useStore()
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
    { id: 'vegetables', name: 'Vegetables', count: 15 },
    { id: 'fruits', name: 'Fruits', count: 12 },
    { id: 'grains', name: 'Grains', count: 8 },
    { id: 'dairy', name: 'Dairy', count: 6 },
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
  const filteredProducts =
    products
      ?.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
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
      ?.sort((a, b) => {
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
      }) || []

  // Add to cart function
  const handleAddToCart = (product: Product) => {
    cartActions.addToCart(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-card rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={product.image_url || './market-concept-with-vegetables.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <button className="absolute top-2 right-2 p-2 bg-card rounded-full shadow hover:bg-gray-100">
          <Heart size={16} className="text-fresh-primary" />
        </button>
        {product.stock_quantity && parseInt(product.stock_quantity) < 10 && (
          <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </div>
        )}
      </div>
      <div className="p-4 space-y-2 flex flex-col">
        <div className="text-sm text-fresh-primary flex justify-between items-center">
          <h3 className="text-lg font-semibold text-fresh-primary">{product.name}</h3>
          <p>{product.category?.name}</p>
        </div>
        <div className="flex items-center justify-between gap-1 text-sm">
          <div className="text-sm text-fresh-primary">
            {currentStore?.name || 'Store'}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-fresh-primary">{product.rating}</span>
            <span className="text-fresh-primary">({product.review_count})</span>
          </div>
        </div>
        <div className="font-bold text-fresh-secondary">
          {typeof product.price === 'string' &&
            (product.price.includes('Box') || product.price.includes('Pack')) ? (
            product.price
          ) : (
            <>KSh {product.price}</>
          )}
        </div>
        <button
          onClick={() => handleAddToCart(product)}
          className="bg-fresh-primary hover:bg-fresh-secondary/90 text-fresh-primary-foreground px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
          disabled={
            !product.stock_quantity || parseInt(product.stock_quantity) === 0
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
              <span className='flex items-center justify-between'>{item.product.name} <p className='bg-fresh-primary p-1 rounded-full ml-2 shadow-2xl'>{item.quantity}</p></span>
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
        <Link to="/customer/cart" className="flex justify-center w-full bg-fresh-primary hover:bg-fresh-secondary text-white px-4 py-2 rounded-lg transition-colors">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  )
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-64 w-full relative overflow-hidden">
        <img
          src="./market-concept-with-vegetables.jpg"
          alt="Store Banner"
          className="w-full h-full object-cover"
        />
        <div className="flex-col absolute inset-0 bg-black/50 w-full h-full object-cover">
          <div className='flex items-center justify-center my-20 flex-col'>
            <h1 className="text-5xl font-bold text-white">
              {currentStore?.name} 🌱
            </h1>
            {/* <p className="text-fresh-primary">{currentStore?.county} County</p> */}
          </div>
        </div>
      </div>

      {/* Store Header */}
      <div className="bg-card shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src="/market-concept-with-vegetables.jpg"
            alt="Store Logo"
            className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentStore?.name} 🌱
            </h1>
            <p className="text-fresh-primary">{currentStore?.county} County</p>
            <div className="mt-2 flex flex-col sm:flex-row gap-2 text-sm text-fresh-primary">
              <span><LocateFixedIcon className="inline-block w-4 h-4 mr-1" /> {currentStore?.town}</span>
              <span>Owned by {currentStore?.owner?.profile?.first_name} {currentStore?.owner?.profile?.last_name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingCart className="w-8 h-8 text-fresh-primary"
                onClick={() => navigate({ to: '/customer/cart' })} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <img
              src="/market-concept-with-vegetables.jpg"
              alt="Owner Avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
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
      <div className="max-w-8xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 bg-search justify-center">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 space-y-6">
            <div className="bg-card rounded-lg p-4 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-fresh-primary" />
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
                        {option.name} ({option.count})
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
                  <Search className="absolute left-3 top-3 h-4 w-4 text-fresh-primary" />
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

            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <span className="text-fresh-primary">
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
                  <span className="text-fresh-primary">Sort by:</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  Loading products...
                </div>
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
      </div>
    </div>
  )
}

export default StoreLayout
