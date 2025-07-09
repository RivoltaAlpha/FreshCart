import { useEffect, useRef, useState } from 'react';
import { Star, Search, Filter, Plus, Minus } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router'
import { useProducts } from '@/hooks/useProducts';
import Categories from '@/components/categories';
import type { BackendProduct } from '@/types/types';
import { sampleProducts } from '@/data/sample-products';

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})



// Updated types to match backend response
type Cart = Record<number, number>;
type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
  unit: string;
  weight: number;
  discount?: number;
};

function ProductsPage() {
  const { data: productsData, isLoading, error } = useProducts();
  console.log('Products hook data:', { productsData, isLoading, error });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const isInitialMount = useRef(true);
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

    // Store product data for AI recommendations
    localStorage.setItem('appData', JSON.stringify({ products: safeProducts }));

    isInitialMount.current = false;
  }, [products]);

  // Save cart to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem('freshcart-cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Save detailed cart items with product info to localStorage
  const saveCartItemsToLocalStorage = (currentCart: Cart) => {
    const cartItems: CartItem[] = Object.entries(currentCart).map(([productId, quantity]) => {
      const product = safeProducts.find(p => p.product_id === parseInt(productId));
      if (!product) return null;

      return {
        id: product.product_id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image_url,
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

  const removeFromCart = (product_id: number): void => {
    setCart(prev => {
      const currentQty = prev[product_id] || 0;
      let newCart: Cart;

      if (currentQty <= 1) {
        newCart = { ...prev };
        delete newCart[product_id];
      } else {
        newCart = {
          ...prev,
          [product_id]: currentQty - 1
        };
      }

      // Save detailed cart items
      saveCartItemsToLocalStorage(newCart);

      return newCart;
    });
  };

  return (
    <div className="home-page min-h-screen bg-background py-8">
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
                        className="w-full h-full object-cover"
                      />
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

                      <h3 className="text-xl font-bold text-foreground mb-1">{product.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{product.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-2xl font-bold text-fresh-primary">KSh {parseFloat(product.price).toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground ml-1">{product.unit}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{product.stock_quantity} in stock</span>
                      </div>

                      <div className="flex items-center justify-between">
                        {cart[product.product_id] > 0 ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeFromCart(product.product_id)}
                              className="w-8 h-8 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-semibold text-fresh-primary">{cart[product.product_id]}</span>
                            <button
                              onClick={() => addToCart(product.product_id)}
                              className="w-8 h-8 bg-fresh-primary hover:bg-fresh-primary/90 text-fresh-primary-foreground rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product.product_id)}
                            className="bg-fresh-secondary hover:bg-fresh-secondary/90 text-fresh-primary-foreground px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add to Cart
                          </button>
                        )}
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
  );
}

// Test function to verify backend connectivity for products
export const testProductsAPI = async () => {
  try {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const token = auth.tokens?.accessToken;

    console.log('Testing products API...', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
    });

    if (!token) {
      console.log('❌ No authentication token found in localStorage');
      return { success: false, error: 'No auth token' };
    }

    const response = await fetch('http://localhost:8000/products/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Products API test successful:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Products API test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};

export default ProductsPage;