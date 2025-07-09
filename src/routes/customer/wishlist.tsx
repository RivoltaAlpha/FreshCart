import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  Heart,
  Trash2,
  ArrowLeft,
  Star,
  Package,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { cartActions } from '@/store/cart'
import type { Product } from '@/types/types'

export const Route = createFileRoute('/customer/wishlist')({
  component: RouteComponent,
})

interface WishlistItem {
  product_id: number
  name: string
  price: string | number
  image_url: string
  rating?: string | number
  discount?: number
  unit?: string
  weight?: number
  category?: string
  description?: string
}

function RouteComponent() {
  const navigate = useNavigate()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load wishlist from localStorage
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
          const parsedWishlist = JSON.parse(savedWishlist)
          console.log('Loaded wishlist:', parsedWishlist)

          // Handle different possible wishlist formats
          if (Array.isArray(parsedWishlist)) {
            setWishlistItems(parsedWishlist)
          } else {
            setWishlistItems([])
          }
        } else {
          setWishlistItems([])
        }
      } catch (error) {
        console.error('Error loading wishlist:', error)
        setWishlistItems([])
        toast.error('Error loading wishlist')
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [])

  // Save wishlist to localStorage
  const saveWishlist = (items: WishlistItem[]) => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(items))
      setWishlistItems(items)
    } catch (error) {
      console.error('Error saving wishlist:', error)
      toast.error('Error saving wishlist')
    }
  }

  // Remove item from wishlist
  const removeFromWishlist = (productId: number) => {
    const updatedWishlist = wishlistItems.filter(item => item.product_id !== productId)
    saveWishlist(updatedWishlist)
    toast.success('Item removed from wishlist')
  }

  // Add item to cart
  const addToCart = (item: WishlistItem) => {
    try {
      // Convert wishlist item to Product format for cart
      const product: Product = {
        product_id: item.product_id,
        name: item.name,
        price: item.price.toString(),
        image_url: item.image_url,
        rating: item.rating?.toString() || '0',
        discount: item.discount || 0,
        unit: item.unit || 'piece',
        weight: item.weight?.toString() || '0',
        description: item.description || '',
        // Required fields with defaults
        category_id: 0,
        stock_quantity: '999',
        review_count: 0,
        expiry_date: null,
        created_at: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          category_id: 0,
          name: item.category || 'General',
          description: '',
          image_url: '',
          created_at: new Date().toISOString()
        }
      }

      cartActions.addToCart(product, 1)
      toast.success(`${item.name} added to cart!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Error adding item to cart')
    }
  }

  // Clear entire wishlist
  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      saveWishlist([])
      toast.success('Wishlist cleared')
    }
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  const getDiscountedPrice = (price: string | number, discount: number = 0) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return discount > 0 ? numPrice * (1 - discount / 100) : numPrice
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate({ to: '/products' })}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            </div>
          </div>

          {wishlistItems.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
              </p>
              <button
                onClick={clearWishlist}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love for later. Browse our products and add them to your wishlist!
            </p>
            <button
              onClick={() => navigate({ to: '/products' })}
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Package className="h-5 w-5" />
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item, index) => (
              <div
                key={`wishlist-${item.product_id}-${index}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Product Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {item.discount && item.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      -{item.discount}%
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 p-2 rounded-full shadow-md transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  {item.category && (
                    <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                  )}

                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {typeof item.rating === 'string' ? parseFloat(item.rating).toFixed(1) : item.rating.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    {item.discount && item.discount > 0 ? (
                      <>
                        <span className="text-lg font-bold text-[#00A7B3]">
                          KSh {formatPrice(getDiscountedPrice(item.price, item.discount))}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          KSh {formatPrice(item.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-[#00A7B3]">
                        KSh {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {/* Unit info */}
                  {item.unit && (
                    <p className="text-sm text-gray-500 mb-3">per {item.unit}</p>
                  )}

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistItems.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate({ to: '/stores' })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Package className="h-5 w-5" />
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
