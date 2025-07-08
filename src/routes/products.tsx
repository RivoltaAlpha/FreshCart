import { useEffect, useRef, useState } from 'react';
import { Star, Search, Filter, Plus, Minus } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router'
import { useProducts } from '@/hooks/useProducts';
import type { BackendProduct } from '@/types/types';

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
  const { data: backendResponse } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Cart>({});
  const isInitialMount = useRef(true);

  // Transform backend data to match component expectations
  const products: BackendProduct[] = backendResponse?.products || [];

  const categories = ['All', ...new Set(products?.map(p => p.category?.name))];

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    localStorage.setItem('appData', JSON.stringify({ products }));

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
      const product = products.find(p => p.product_id === parseInt(productId));
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

    localStorage.setItem('freshcart-cart-items', JSON.stringify(cartItems));

    // Also save cart totals for quick access
    const cartSummary = {
      totalItems: Object.values(currentCart).reduce((total, qty) => total + qty, 0),
      totalPrice: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('freshcart-cart-summary', JSON.stringify(cartSummary));
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

  // Clear entire cart
  const clearCart = () => {
    setCart({});
    localStorage.removeItem('freshcart-cart');
    localStorage.removeItem('freshcart-cart-items');
    localStorage.removeItem('freshcart-cart-summary');
  };

  // Calculate total cart items
  const cartItems = Object.values(cart).reduce((total, quantity) => total + quantity, 0);

  // Calculate total price
  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = products.find(p => p.product_id === parseInt(productId));
    return total + (product ? parseFloat(product.price) * quantity : 0);
  }, 0);

  return (
    <div className="home-page min-h-screen bg-background py-8">
      <div className="max-w-8xl lg:mx-28 md:auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-fresh-primary mb-4">Fresh Products</h1>
              <p className="text-fresh-secondary text-lg">Discover our wide selection of fresh, quality groceries</p>
            </div>

            {/* Cart Summary */}
            {cartItems > 0 && (
              <div className="bg-fresh-primary text-fresh-primary-foreground p-4 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold">{cartItems}</div>
                  <div className="text-sm">Items in Cart</div>
                  <div className="text-lg font-semibold">KSh {cartTotal.toFixed(2)}</div>
                  <button
                    onClick={clearCart}
                    className="mt-2 text-xs bg-fresh-secondary hover:bg-fresh-secondary/80 text-fresh-secondary-foreground px-3 py-1 rounded-full transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
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
          {filteredProducts?.map((product) => (
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
          ))}
        </div>

        {filteredProducts?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;