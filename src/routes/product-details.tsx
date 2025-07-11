import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cartActions } from '@/store/cart'
import { toast } from 'sonner'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import type { Product } from '@/types/types'

type ProductDetailsSearch = {
  productId?: string
  name?: string
  price?: string
  image?: string
  description?: string
  category?: string
  stock?: string
  rating?: string
  reviews?: string
}

export const Route = createFileRoute('/product-details')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): ProductDetailsSearch => {
    return {
      productId: search.productId as string,
      name: search.name as string,
      price: search.price as string,
      image: search.image as string,
      description: search.description as string,
      category: search.category as string,
      stock: search.stock as string,
      rating: search.rating as string,
      reviews: search.reviews as string,
    }
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/product-details' })
  const [quantity, setQuantity] = useState(1)
  const [selectedTab, setSelectedTab] = useState('description')

  const product: Product = {
    product_id: parseInt(search.productId || '0'),
    category_id: 1, // Default category ID
    name: search.name || 'Product Name',
    description: search.description || 'No description available',
    price: parseFloat(search.price || '0'),
    stock_quantity: parseInt(search.stock || '0'),
    image_url: search.image || '',
    weight: '1kg', // Default weight
    unit: 'piece', // Default unit
    rating: search.rating || '4.5',
    review_count: parseInt(search.reviews || '0'),
    discount: 0, // Default discount
    expiry_date: null, // Default expiry
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    category: {
      category_id: 1,
      name: search.category || 'Uncategorized',
      description: 'Category description',
      image_url: '',
      created_at: new Date().toISOString(),
    },
  }

  const handleAddToCart = () => {
    cartActions.addToCart(product, quantity)
    toast.success(`${quantity} x ${product.name} added to cart!`)
  }

  const handleGoBack = () => {
    navigate({ to: '/shop-store' })
  }

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'nutrition', label: 'Nutrition Info' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-[#05445E] hover:text-[#189AB4] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Store
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={product.image_url || '/market-concept-with-vegetables.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-[#05445E] mb-2">{product.name}</h1>
                <p className="text-[#189AB4] text-lg">{product.category.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating))
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#05445E]">{product.rating}</span>
                  <span className="text-gray-500">({product.review_count} reviews)</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-[#189AB4]">
                KSh {product.price.toFixed(2)}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.stock_quantity > 10 ? 'bg-green-500' :
                    product.stock_quantity > 0 ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                <span className="text-[#05445E]">
                  {product.stock_quantity > 10 ? 'In Stock' :
                    product.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                </span>
                <span className="text-gray-500">({product.stock_quantity} available)</span>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-[#05445E] font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-[#05445E] hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-[#05445E] font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-3 py-2 text-[#05445E] hover:bg-gray-100"
                      disabled={quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-[#189AB4] hover:bg-[#75E6DA] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                    <Heart className="w-5 h-5 text-[#05445E]" />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-[#189AB4]" />
                  <span className="text-[#05445E]">Free delivery on orders over KSh 1000</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#189AB4]" />
                  <span className="text-[#05445E]">Fresh guarantee - 100% quality assured</span>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-[#189AB4]" />
                  <span className="text-[#05445E]">Easy returns within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.id
                        ? 'border-[#189AB4] text-[#189AB4]'
                        : 'border-transparent text-gray-500 hover:text-[#05445E] hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="py-8">
              {selectedTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-[#05445E] text-lg leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
              {selectedTab === 'nutrition' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#05445E] mb-4">Nutritional Information</h3>
                  <p className="text-[#05445E]">
                    Detailed nutritional information will be displayed here based on the product type.
                  </p>
                </div>
              )}
              {selectedTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold text-[#05445E] mb-4">Customer Reviews</h3>
                  <p className="text-[#05445E]">
                    Customer reviews and ratings will be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
