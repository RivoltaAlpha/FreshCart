import { useEffect, useRef, useState } from 'react';
import { Star, Search, Filter, ShoppingCart, Eye, Heart, TrendingUp } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useProducts } from '@/hooks/useProducts';
import Categories from '@/components/categories';
import type { BackendProduct } from '@/types/types';
import { sampleProducts } from '@/data/sample-products';
import Header from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { storeActions } from '@/store/store';
import { toast } from 'sonner';
import { getStoreHavingProduct } from '@/services/storeService';

export const Route = createFileRoute('/products')({
  component: RouteComponent,
})

// Updated types to match backend response
type Cart = Record<number, number>;
type CartItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  category: string;
  unit: string;
  weight: number;
  discount?: number;
};

function RouteComponent() {
  const { data: productsData, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  console.log( cart);
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitialMount = useRef(true);
  const navigate = useNavigate();
  const products: BackendProduct[] = productsData || [];

  const shouldUseSampleData = products.length === 0 && !!error;
  const safeProducts = shouldUseSampleData ? sampleProducts : (Array.isArray(products) ? products : []);

  // Get unique categories from products
  const productCategories = safeProducts.map(p => p.category?.name).filter(Boolean);
  const categories = ['All', ...new Set(productCategories)];

  const filteredProducts = safeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Handle category filtering - support both ID and name based filtering
    let matchesCategory = selectedCategory === 'All';
    if (!matchesCategory) {
      // If we have a selectedCategoryId, filter by ID, otherwise by name
      if (selectedCategoryId !== null) {
        matchesCategory = product.category?.category_id === selectedCategoryId;
      } else {
        matchesCategory = product.category?.name === selectedCategory;
      }
    }

    return matchesSearch && matchesCategory;
  });

  // Handle category selection from the Categories component
  const handleCategorySelect = (categoryId: number | null, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryName === 'All Categories' ? 'All' : categoryName);
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
      return newFavorites;
    });
  };

  // Load cart from localStorage on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      const savedCart = localStorage.getItem('freshcart-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('freshcart-cart');
        }
      }
      isInitialMount.current = false;
    }
  }, []);

  // Store product data for AI recommendations
  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify({ products: safeProducts }));
  }, [safeProducts]);

  // Save detailed cart items with product info to localStorage
  const saveCartItemsToLocalStorage = (currentCart: Cart) => {
    const cartItems: CartItem[] = Object.entries(currentCart).map(([productId, quantity]) => {
      const product = safeProducts.find(p => p.product_id === parseInt(productId));
      if (!product) return null;

      return {
        id: product.product_id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity,
        category: product.category?.name || 'Unknown',
        unit: product.unit,
        weight: parseFloat(product.weight),
        discount: product.discount,
      };
    }).filter(Boolean) as CartItem[];

    localStorage.setItem('wishlist', JSON.stringify(cartItems));
  };

  const addToCart = (product_id: number): void => {
    setCart((prev) => {
      const newCart = {
        ...prev,
        [product_id]: (prev[product_id] || 0) + 1
      };

      // Save detailed cart items
      saveCartItemsToLocalStorage(newCart);

      return newCart;
    });
  };

  // navigation to store with product
  const handleShopProduct = async (product: any) => {
    addToCart(product.product_id);
    // Fetch store for this product
    try {
      const store = await getStoreHavingProduct(product.product_id)

      console.log(store)

      // Save store in your storeActions (or context)
      storeActions.saveStore(store);

      // Navigate to shop-store page
      navigate({ to: '/shop-store' });
    } catch (err) {
      toast.error('Could not find store for this product.');
    }
  };

  // Modal and navigation handlers
  const handleProductClick = (product: BackendProduct | any) => {
    setSelectedProduct(product as BackendProduct);
    setIsModalOpen(true);
  };

  const handleViewDetails = () => {
    if (selectedProduct) {
      navigate({
        to: '/product-details',
        search: {
          productId: selectedProduct.product_id.toString(),
          name: selectedProduct.name,
          price: selectedProduct.price.toString(),
          image: selectedProduct.image_url,
          description: selectedProduct.description || 'Fresh, high-quality product.',
          category: selectedProduct.category?.name || 'Uncategorized',
          stock: selectedProduct.stock_quantity?.toString() || '0',
          rating: selectedProduct.rating?.toString() || '4.5',
          reviews: selectedProduct.review_count?.toString() || '0',
        },
      });
    }
    setIsModalOpen(false);
  };

  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      addToCart(selectedProduct.product_id);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Header />
      <div className="home-page min-h-screen bg-background">
        {/* Enhanced Banner */}
        <div className="h-72 w-full relative overflow-hidden">
          <img
            src="./market-concept-with-vegetables.jpg"
            alt="Store Banner"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30">
            <div className='flex items-center justify-center h-full space-y-6 flex-col'>
              <div className="text-center space-y-4 animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg transform hover:scale-105 transition-transform duration-300">
                  Fresh Products
                </h1>
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <TrendingUp className="h-6 w-6" />
                  <h3 className="text-white text-xl md:text-2xl">Discover our wide selection of fresh, quality groceries</h3>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-fresh-primary to-fresh-secondary mx-auto rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-8xl lg:mx-28 md:auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground animate-pulse">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && !shouldUseSampleData && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8 animate-fade-in">
              <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Products</h2>
              <p className="text-muted-foreground">
                {error.message || 'Failed to load products. Please try again later.'}
              </p>
            </div>
          )}

          {/* Main Content - only show when not loading */}
          {!isLoading && (
            <>
              {/* Categories Section */}
              <div className="mb-8 flex flex-col space-y-12">
                <div className="text-center animate-fade-in-up">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Browse by Category</h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-fresh-primary to-fresh-secondary mx-auto rounded-full mb-6"></div>
                </div>
                <Categories
                  onCategorySelect={handleCategorySelect}
                  selectedCategoryId={selectedCategoryId}
                  showAllOption={true}
                  gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
                  className=""
                />
              </div>

              {/* Enhanced Search and Filter */}
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-3xl shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-fresh-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-fresh-primary/20 focus:border-fresh-primary bg-white text-foreground transition-all duration-300 hover:shadow-md"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white rounded-2xl px-4 py-2 border border-gray-200">
                    <Filter className="text-fresh-primary h-5 w-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border-none bg-transparent focus:ring-2 focus:ring-fresh-primary rounded-xl text-foreground cursor-pointer"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Enhanced Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts?.length > 0 ? (
                  filteredProducts.map((product, index) => (
                    <div 
                      key={product.product_id} 
                      className="group relative bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Image Container with Enhanced Effects */}
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-500"
                          onClick={() => handleProductClick(product)}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                          <button
                            onClick={() => handleProductClick(product)}
                            className="p-2.5 bg-white/90 backdrop-blur-sm text-fresh-primary rounded-full shadow-lg hover:bg-fresh-primary hover:text-white transition-all duration-300 transform hover:scale-110"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(product.product_id);
                            }}
                            className={`p-2.5 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                              favorites.has(product.product_id) 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <Heart size={18} className={favorites.has(product.product_id) ? 'fill-current' : ''} 
                            />
                          </button>
                        </div>

                        {/* Discount Badge */}
                        {product.discount > 0 && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-bounce">
                            -{product.discount}%
                          </div>
                        )}

                        {/* Stock Status */}
                        <div className="absolute bottom-3 left-3">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            product.stock_quantity > 10
                              ? 'bg-green-500/90 text-white'
                              : product.stock_quantity > 0
                                ? 'bg-yellow-500/90 text-white'
                                : 'bg-red-500/90 text-white'
                          }`}>
                            {product.stock_quantity > 10 ? 'In Stock' : product.stock_quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                          </div>
                        </div>

                        {/* Hover Overlay Button */}
                        <div className="absolute inset-0 bg-gradient-to-t from-fresh-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                          <button 
                            onClick={() => handleProductClick(product)}
                            className="bg-white text-fresh-primary px-6 py-2.5 rounded-full font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-fresh-primary hover:text-white shadow-lg"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Content */}
                      <div className="p-6 space-y-4">
                        {/* Category & Rating Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-fresh-primary bg-fresh-primary/10 px-3 py-1.5 rounded-full font-medium">
                            {product.category?.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-600">{product.rating}</span>
                            <span className="text-xs text-gray-400">({product.review_count})</span>
                          </div>
                        </div>

                        {/* Product Name */}
                        <h3
                          className="text-lg font-bold text-foreground cursor-pointer hover:text-fresh-primary transition-colors duration-300 line-clamp-2"
                          onClick={() => handleProductClick(product)}
                        >
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>

                        {/* Price & Stock */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-fresh-primary">KSh {product.price}</span>
                              <span className="text-sm text-muted-foreground">/{product.unit}</span>
                            </div>
                            <span className="text-xs text-gray-500">{product.stock_quantity} available</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => handleShopProduct(product)}
                          disabled={product.stock_quantity === 0}
                          className="w-full bg-gradient-to-r from-fresh-primary to-fresh-secondary hover:from-fresh-secondary hover:to-fresh-primary text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <ShoppingCart size={18} />
                          {product.stock_quantity === 0 ? 'Out of Stock' : 'Shop Now'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  // Enhanced No Products Message
                  <div className="col-span-full text-center py-16">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-12 shadow-lg border border-gray-200 max-w-2xl mx-auto">
                      <div className="w-24 h-24 bg-gradient-to-r from-fresh-primary to-fresh-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Search className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {safeProducts.length === 0 ? 'No Products Available' : 'No Products Match Your Filters'}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {safeProducts.length === 0
                          ? 'Products will appear here once they are added to the system.'
                          : `Try adjusting your search term or selected category. Currently filtering for "${selectedCategory}".`
                        }
                      </p>
                      {selectedCategory !== 'All' && (
                        <button
                          onClick={() => {
                            setSelectedCategory('All');
                            setSelectedCategoryId(null);
                            setSearchTerm('');
                          }}
                          className="bg-gradient-to-r from-fresh-primary to-fresh-secondary hover:from-fresh-secondary hover:to-fresh-primary text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl rounded-3xl border-none shadow-2xl">
          <DialogClose onClick={() => setIsModalOpen(false)} />
          {selectedProduct && (
            <>
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-[#05445E] to-fresh-primary bg-clip-text text-transparent">
                  {selectedProduct.name}
                </DialogTitle>
                <DialogDescription className="text-fresh-primary text-lg font-medium">
                  {selectedProduct.category?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                {/* Product Image */}
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-inner">
                  <img
                    src={selectedProduct.image_url || './market-concept-with-vegetables.jpg'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-fresh-primary to-fresh-secondary bg-clip-text text-transparent">
                    KSh {selectedProduct.price}
                    <span className="text-lg text-gray-500 ml-2">/{selectedProduct.unit}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-3 bg-yellow-50 p-3 rounded-xl">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                      <span className="text-gray-700 ml-2 font-medium">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-gray-500">({selectedProduct.review_count} reviews)</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200">
                    <div className={`w-4 h-4 rounded-full ${selectedProduct.stock_quantity > 10
                      ? 'bg-green-500 animate-pulse'
                      : selectedProduct.stock_quantity > 0
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`} />
                    <span className="font-medium text-gray-800">
                      {selectedProduct.stock_quantity > 10
                        ? 'In Stock'
                        : selectedProduct.stock_quantity > 0
                          ? 'Low Stock'
                          : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500">({selectedProduct.stock_quantity} available)</span>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-xl text-gray-800">Description</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedProduct.description || 'Fresh, high-quality product.'}
                    </p>
                  </div>

                  {/* Product Details Card */}
                  <div className="bg-gradient-to-r from-fresh-primary/5 to-fresh-secondary/5 rounded-2xl p-6 border border-fresh-primary/10">
                    <h4 className="font-bold text-gray-800 mb-4 text-lg">Product Specifications</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <p className="text-gray-600">Weight:</p>
                        <p className="font-medium text-gray-800">{selectedProduct.weight}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-600">Unit:</p>
                        <p className="font-medium text-gray-800">{selectedProduct.unit}</p>
                      </div>
                      {selectedProduct.discount > 0 && (
                        <div className="col-span-2 space-y-2">
                          <p className="text-gray-600">Discount:</p>
                          <p className="text-red-600 font-bold text-lg">{selectedProduct.discount}% OFF</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleAddToCartFromModal}
                  disabled={selectedProduct.stock_quantity === 0}
                  className="flex-1 bg-gradient-to-r from-fresh-primary to-fresh-secondary hover:from-fresh-secondary hover:to-fresh-primary text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart size={22} />
                  Shop
                </button>
                <button
                  onClick={handleViewDetails}
                  className="flex-1 bg-gradient-to-r from-[#05445E] to-gray-800 hover:from-gray-800 hover:to-[#05445E] text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Eye size={22} />
                  View Full Details
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  );
}
