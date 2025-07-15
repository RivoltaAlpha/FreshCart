import { useEffect, useRef, useState } from 'react';
import { Star, Search, Filter, ShoppingCart, Eye } from 'lucide-react';
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
  component: ProductsPage,
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

function ProductsPage() {
  const { data: productsData, isLoading, error } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [selectedProduct, setSelectedProduct] = useState<BackendProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isInitialMount = useRef(true);
  const navigate = useNavigate();
  const products: BackendProduct[] = productsData?.products || [];


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

  // Load cart from localStorage on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      const savedCart = localStorage.getItem('freshcart-cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart); // Only set cart on initial mount
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
          localStorage.removeItem('freshcart-cart');
        }
      }
      isInitialMount.current = false;
    }
  }, []); // Run only once on mount

  // Store product data for AI recommendations
  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify({ products: safeProducts }));
  }, [safeProducts]); // Run only when safeProducts changes

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
        {/* Banner */}
        <div className="h-72 w-full relative overflow-hidden">
          <img
            src="./market-concept-with-vegetables.jpg"
            alt="Store Banner"
            className="w-full h-full object-cover"
          />
          <div className="flex-col absolute inset-0 bg-black/50 w-full h-full object-cover">
            <div className='flex items-center justify-center my-20 space-y-6 flex-col'>
              <h1 className="text-5xl font-bold text-white">
                Fresh Products...
              </h1>
              <h3 className="text-white text-2xl">Discover our wide selection of fresh, quality groceries</h3>
            </div>
          </div>
        </div>
        <div className="max-w-8xl lg:mx-28 md:auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fresh-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && !shouldUseSampleData && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Products</h2>
              <p className="text-muted-foreground">
                {error.message || 'Failed to load products. Please try again later.'}
              </p>
            </div>
          )}

          {/* Authentication Error - Using Sample Data */}
          {shouldUseSampleData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">Using Sample Data</h2>
              <p className="text-yellow-700">
                Authentication required to load products from backend. Currently showing sample products.
                Please log in to view actual products.
              </p>
            </div>
          )}

          {/* Backend returned empty - show info */}
          {!isLoading && !error && products && products.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">No Products Found</h2>
              <p className="text-blue-700">
                Connected to backend successfully, but no products are available in the database.
              </p>
            </div>
          )}

          {/* Main Content - only show when not loading */}
          {!isLoading && (
            <>            {/* Categories Section */}
              <div className="mb-8 flex flex-col space-y-12">
                <h2 className="text-2xl flex justify-center font-bold text-foreground mb-6">Browse by Category</h2>
                <Categories
                  onCategorySelect={handleCategorySelect}
                  selectedCategoryId={selectedCategoryId}
                  showAllOption={true}
                  gridCols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
                  className=""
                />
              </div>

              {/* Search and Filter */}
              <div className="bg-card border p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-full focus:ring-2 focus:ring-fresh-primary focus:border-fresh-primary bg-background text-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="text-muted-foreground h-5 w-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-3 border border-border rounded-full focus:ring-2 focus:ring-fresh-primary focus:border-fresh-primary bg-background text-foreground"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts?.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.product_id} className="bg-card border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="relative h-48">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                          onClick={() => handleProductClick(product)}
                        />
                        <button
                          onClick={() => handleProductClick(product)}
                          className="absolute top-2 left-2 p-2 bg-[#189AB4] text-white rounded-full shadow hover:bg-[#05445E] transition-colors"
                        >
                          <Eye size={16} />
                        </button>
                        {product.discount > 0 && (
                          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                            -{product.discount}%
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                            {product.category?.name}
                          </span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-muted-foreground">{product.rating}</span>
                            <span className="ml-1 text-xs text-muted-foreground">({product.review_count})</span>
                          </div>
                        </div>

                        <h3
                          className="text-xl font-bold text-foreground mb-1 cursor-pointer hover:text-[#189AB4] transition-colors"
                          onClick={() => handleProductClick(product)}
                        >
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">{product.description}</p>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold text-fresh-primary">KSh {product.price}</span>
                            <span className="text-sm text-muted-foreground ml-1">{product.unit}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{product.stock_quantity} in stock</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <button
                            onClick={() => handleShopProduct(product)}
                            className="bg-fresh-secondary hover:bg-fresh-secondary/90 text-fresh-primary-foreground px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
                          >
                            Shop
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show placeholder message when no products
                  <div className="col-span-full text-center py-12">
                    <div className="bg-muted/50 rounded-lg p-8">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {safeProducts.length === 0 ? 'No Products Available' : 'No Products Match Your Filters'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
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
                          className="bg-fresh-primary hover:bg-fresh-primary/90 text-fresh-primary-foreground px-6 py-2 rounded-full font-semibold transition-colors"
                        >
                          Clear Filters
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
                    KSh {selectedProduct.price}
                    <span className="text-sm text-gray-500 ml-2">{selectedProduct.unit}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-[#05445E] ml-1">{selectedProduct.rating}</span>
                    </div>
                    <span className="text-gray-500">({selectedProduct.review_count} reviews)</span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedProduct.stock_quantity > 10
                      ? 'bg-green-500'
                      : selectedProduct.stock_quantity > 0
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`} />
                    <span className="text-[#05445E]">
                      {selectedProduct.stock_quantity > 10
                        ? 'In Stock'
                        : selectedProduct.stock_quantity > 0
                          ? 'Low Stock'
                          : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500">({selectedProduct.stock_quantity} available)</span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#05445E]">Description</h4>
                    <p className="text-gray-600 text-sm">
                      {selectedProduct.description || 'Fresh, high-quality product.'}
                    </p>
                  </div>

                  {/* Weight/Unit Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-[#05445E] mb-2">Product Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Weight: {selectedProduct.weight}</p>
                      <p>Unit: {selectedProduct.unit}</p>
                      {selectedProduct.discount > 0 && (
                        <p className="text-red-600 font-medium">Discount: {selectedProduct.discount}%</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAddToCartFromModal}
                  disabled={selectedProduct.stock_quantity === 0}
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
  );
}

export default ProductsPage;