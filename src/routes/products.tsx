import { useState } from 'react';
import { Star, MapPin, Search, Filter, Plus, Minus } from 'lucide-react';
import sampleProducts from "../../public/marketplaceItems.json"
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage () {
  const [products] = useState(sampleProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<Record<number, number>>({});

  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

interface Product {
    id: number;
    name: string;
    seller: string;
    category: string;
    image: string;
    harvestDate: string;
    rating: number;
    description: string;
    location: string;
    price: number;
    unit: string;
    quantity: string;
}

type Cart = Record<string, number>;

// Fix: Use number consistently for product IDs
  const addToCart = (product_id: number): void => {
    setCart((prev) => ({
        ...prev,
        [product_id]: (prev[product_id] || 0) + 1
    }));
  };

  const removeFromCart = (product_id: number): void => {
    setCart(prev => {
      const currentQty = prev[product_id] || 0;
      if (currentQty <= 1) {
        const newCart = { ...prev };
        delete newCart[product_id];
        return newCart;
      }
      return {
        ...prev,
        [product_id]: currentQty - 1
      };
    });
  };

  // Calculate total cart items
  const cartItems = Object.values(cart).reduce((total, quantity) => total + quantity, 0);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-8xl lg:mx-28 md:auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-fresh-primary  mb-4">Fresh Products</h1>
          <p className="text-fresh-secondary  text-lg">Discover our wide selection of fresh, quality groceries</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-searchbar p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-fresh-secondary  h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-fresh-secondary  h-5 w-5" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
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
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-card rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-[#00A7B3] text-white px-2 py-1 rounded-full text-sm font-semibold">
                  {product.harvestDate}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-fresh-secondary  bg-fresh-accent  px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-fresh-secondary ">{product.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-fresh-primary  mb-1">{product.name}</h3>
                <p className="text-fresh-secondary  text-sm mb-2">{product.seller}</p>
                <p className="text-fresh-secondary  text-sm mb-3">{product.description}</p>
                
                <div className="flex items-center mb-3">
                  <MapPin className="h-4 w-4 text-[#00A7B3] mr-1" />
                  <span className="text-sm text-fresh-secondary ">{product.location}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-fresh-primary ">KSh {product.price}</span>
                    <span className="text-sm text-fresh-secondary  ml-1">{product.unit}</span>
                  </div>
                  <span className="text-sm text-fresh-secondary ">{product.quantity}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  {cart[product.id] > 0 ? (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold text-fresh-primary ">{cart[product.id]}</span>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-8 h-8 bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                        onClick={() => addToCart(product.id)}
                      className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-fresh-secondary  text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
