import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ShoppingCart, Package, Heart, MapPin, Star, Search, Bell, Plus, Minus, Truck, CreditCard, Gift } from 'lucide-react'


export const Route = createFileRoute('/customer/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Organic Bananas', price: 3.99, quantity: 2, image: '🍌' },
    { id: 2, name: 'Fresh Milk', price: 4.50, quantity: 1, image: '🥛' },
  ])

  const quickStats = [
    { title: 'Orders This Month', value: '12', color: 'bg-blue-500', icon: Package },
    { title: 'Total Saved', value: '$48.50', color: 'bg-blue-700', icon: Gift },
    { title: 'Favorite Items', value: '25', color: 'bg-teal-500', icon: Heart },
    { title: 'Loyalty Points', value: '1,250', color: 'bg-teal-700', icon: Star },
  ]

  const recentOrders = [
    { 
      id: 'ORD001', 
      date: '2024-12-28', 
      items: 8, 
      total: '$67.45',
      status: 'delivered',
      store: 'Fresh Mart'
    },
    { 
      id: 'ORD002', 
      date: '2024-12-25', 
      items: 5, 
      total: '$42.30',
      status: 'delivered',
      store: 'Organic Plus'
    },
    { 
      id: 'ORD003', 
      date: '2024-12-22', 
      items: 12, 
      total: '$89.50',
      status: 'delivered',
      store: 'Fresh Mart'
    },
  ]

  const featuredProducts = [
    { id: 1, name: 'Organic Apples', price: 5.99, rating: 4.8, image: '🍎', discount: '20% OFF' },
    { id: 2, name: 'Free Range Eggs', price: 6.50, rating: 4.9, image: '🥚', discount: null },
    { id: 3, name: 'Whole Grain Bread', price: 3.25, rating: 4.7, image: '🍞', discount: '15% OFF' },
    { id: 4, name: 'Greek Yogurt', price: 4.75, rating: 4.6, image: '🥛', discount: null },
  ]

  interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items: CartItem[]) => 
      items.map((item: CartItem) => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, item.quantity + change) }
          : item
      ).filter((item: CartItem) => item.quantity > 0)
    )
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Welcome back, Tiff!</h1>
              <p className="text-gray-600">Discover fresh groceries and great deals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickStats.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon size={28} className="text-white/80" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Featured Products */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Featured Products</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl">{product.image}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800">{product.name}</h3>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="text-yellow-400 fill-current" size={16} />
                                <span className="text-sm text-gray-600">{product.rating}</span>
                              </div>
                            </div>
                            {product.discount && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                {product.discount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-gray-900">${product.price}</span>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Orders
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Package className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">#{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.store} • {order.items} items</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{order.total}</p>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Current Cart */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Current Cart</h2>
                </div>
                <div className="p-6">
                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{item.image}</span>
                            <div>
                              <p className="font-medium text-gray-800">{item.name}</p>
                              <p className="text-sm text-gray-600">${item.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="w-full mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="text-gray-400 mx-auto mb-4" size={48} />
                      <p className="text-gray-600">Your cart is empty</p>
                      <button className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Truck className="text-blue-600" size={20} />
                    <span>Track Order</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="text-pink-600" size={20} />
                    <span>View Favorites</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <CreditCard className="text-green-600" size={20} />
                    <span>Payment Methods</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <MapPin className="text-purple-600" size={20} />
                    <span>Delivery Address</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}