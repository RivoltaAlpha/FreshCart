import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ArrowLeft, ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cartActions } from '@/store/cart'
import { toast } from 'sonner'
import Header from '@/components/Header'
import { Footer } from '@/components/Footer'
import type { Product } from '@/types/types'
import { useProducts } from '@/hooks/useProducts'
import { storeActions } from '@/store/store'
import { getStoreHavingProduct } from '@/services/storeService'

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
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Fetch category products for related products
  const {
    data: categoryProducts,
    isLoading: isLoadingProducts,
  } = useProducts()

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
    rating: search.rating ? parseFloat(search.rating) : 4.5,
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
    navigate({ to: '/products' })
  }

  // navigation to store with product
  const handleShopProduct = async (product: any) => {
    try {
      const store = await getStoreHavingProduct(product.product_id)
      storeActions.saveStore(store);
      navigate({ to: '/shop-store' });
    } catch (err) {
      toast.error('Could not find store for this product.');
    }
  };

  // Get related products from the same category
  const relatedProducts = useMemo(() => {
    if (!product.category?.name) return []

    return (Array.isArray(categoryProducts) ? categoryProducts : [])
      .filter((p) =>
        p.category?.name === product.category?.name &&
        p.product_id !== product.product_id
      )
      .slice(0, 4) // Limit to 4 related products
  }, [product.category?.name, product.product_id])

  const handleRelatedProductClick = (relatedProduct: Product) => {
    navigate({
      to: '/product-details',
      search: {
        productId: relatedProduct.product_id.toString(),
        name: relatedProduct.name,
        price: relatedProduct.price.toString(),
        image: relatedProduct.image_url,
        description: relatedProduct.description || 'Fresh, high-quality product from our local store.',
        category: relatedProduct.category?.name || 'Uncategorized',
        stock: relatedProduct.stock_quantity?.toString() || '0',
        rating: relatedProduct.rating?.toString() || '4.5',
        reviews: relatedProduct.review_count?.toString() || '0',
      },
    })
  }

  // add to wishlist on localStorage
  const addToWishlist = (product: Product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    toast.success(`${product.name} added to wishlist!`);
  };

  // Toggle favorite
  const toggleFavorite = (productId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      localStorage.setItem('favourites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  const handleAddRelatedToCart = (relatedProduct: Product, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent navigation when clicking add to cart
    cartActions.addToCart(relatedProduct, 1)
    toast.success(`${relatedProduct.name} added to cart!`)
  }

  const RelatedProductCard = ({ product: relatedProduct }: { product: Product }) => (
    <div
      className="bg-card rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => handleRelatedProductClick(relatedProduct)}
    >
      <div className="relative">
        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            src={relatedProduct.image_url || './market-concept-with-vegetables.jpg'}
            alt={relatedProduct.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
        {relatedProduct.stock_quantity && parseInt(String(relatedProduct.stock_quantity)) < 10 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Low Stock
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-[#05445E] line-clamp-2">{relatedProduct.name}</h3>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-current" />
          <span className="text-[#05445E]">{relatedProduct.rating}</span>
          <span className="text-gray-500">({relatedProduct.review_count})</span>
        </div>
        <div className="font-bold text-[#189AB4] text-lg">
          {typeof relatedProduct.price === 'string' &&
            ((relatedProduct.price as string)?.includes('Box') ||
              (relatedProduct.price as string)?.includes('Pack')) ? (
            relatedProduct.price
          ) : (
            <>KSh {relatedProduct.price}</>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { handleAddRelatedToCart(relatedProduct, e); handleShopProduct(relatedProduct); }}
            disabled={!relatedProduct.stock_quantity || parseInt(String(relatedProduct.stock_quantity)) === 0}
            className="p-2 bg-[#189AB4] hover:bg-[#75E6DA] text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            title="Shop"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )

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
            Back to Products
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
                    {[...Array(4)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating)
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
                <div className="mt-4 flex items-center justify-between gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-[#189AB4] hover:bg-[#75E6DA] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.product_id);
                      addToWishlist(product);
                    }}
                    className={`p-2.5 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${favorites.has(product.product_id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90  text-fresh-secondary hover:bg-red-500 hover:text-white'
                      }`}
                  >
                    <Heart size={18} className={favorites.has(product.product_id) ? 'fill-current' : ''}
                    />
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

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#05445E]">Related Products</h2>
                <p className="text-[#189AB4]">More from {product.category?.name}</p>
              </div>

              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <RelatedProductCard
                      key={relatedProduct.product_id}
                      product={relatedProduct}
                    />
                  ))}
                </div>
              )}

              {relatedProducts.length === 4 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => navigate({ to: '/shop-store' })}
                    className="bg-[#05445E] hover:bg-[#189AB4] text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    View All Products
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
