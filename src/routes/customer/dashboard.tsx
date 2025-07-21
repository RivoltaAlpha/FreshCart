import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ShoppingCart, Package, Heart, Star, Plus, Minus, Truck, ShoppingBagIcon, ShoppingBasketIcon } from 'lucide-react'
import { loggedInUser } from '@/store/auth'
import { useCustomerOrders } from '@/hooks/useOrders'
import type { StoreProduct } from '@/types/store'
import { useNavigate } from '@tanstack/react-router'


export const Route = createFileRoute('/customer/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const [cartItems, setCartItems] = useState<{ product: StoreProduct; quantity: number }[]>([])
  const cartTotal = cartItems.reduce((sum: number, item) => {
    const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  useEffect(() => {
    const cartRaw = localStorage.getItem('cart');
    if (cartRaw) {
      try {
        const cartObj = JSON.parse(cartRaw);
        if (cartObj.items && Array.isArray(cartObj.items)) {
          setCartItems(cartObj.items);
        }
      } catch (e) {
      }
    }
  }, []);

  const quickStats = [
    { title: 'Orders This Month', value: '12', color: 'bg-[#30739C]', icon: Package },
    { title: 'Favorite Items', value: '25', color: 'bg-[#0074B7]', icon: Heart },
    { title: 'Loyalty Points', value: '1,250', color: 'bg-[#145DA0]', icon: Star },
  ]

  const user = loggedInUser()
  const { data: orders } = useCustomerOrders(user?.user_id ? parseInt(user.user_id) : 0)

  const recentOrders = orders?.slice(0, 3)
  const navigate = useNavigate();

  // Cart item structure: { product: StoreProduct, quantity: number }

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.product.product_id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  

  return (
    <div id="dashboard" className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-4 gap-6 mb-8">
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
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Orders
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {recentOrders?.map((order) => {
                    const statusSteps = [
                      'confirmed',
                      'preparing',
                      'ready_for_pickup',
                      'in_transit',
                      'delivered',
                    ];
                    const currentStep = statusSteps.indexOf(order.status);
                    return (
                      <div key={order.order_id} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Package className="text-blue-600" size={20} />
                            </div>
                            <div className='space-y-4'>
                              <h3 className="font-semibold text-gray-800">#{order.order_id}</h3>
                              <p className="text-sm">{order.store?.name ?? 'Store'} • {order.items?.length ?? 0} items</p>
                              <p className="text-xs ">{order.created_at}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{order.total_amount}</p>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        {/* Order Progress Circles */}
                        <div className="flex items-center justify-center mt-2">
                          {statusSteps.map((step, idx) => {
                            const isCompleted = idx < currentStep;
                            const isCurrent = idx === currentStep;
                            // Colors: current = #41729F, completed = #274472, upcoming = #5885AF
                            const circleStyle = isCurrent
                              ? { backgroundColor: '#41729F', borderColor: '#41729F', color: 'white', boxShadow: '0 0 6px #41729F' }
                              : isCompleted
                                ? { backgroundColor: '#274472', borderColor: '#274472', color: 'white' }
                                : { backgroundColor: '#EAF0F6', borderColor: '#5885AF', color: '#5885AF' };
                            const labelStyle = isCurrent
                              ? { color: '#41729F', fontWeight: 600 }
                              : isCompleted
                                ? { color: '#274472' }
                                : { color: '#5885AF' };
                            // Connector color
                            const connectorColor = isCompleted ? '#274472' : isCurrent ? '#41729F' : '#5885AF';
                            return (
                              <div key={step} className="flex flex-col items-center">
                                <div className="flex items-center">
                                  <div
                                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
                                    style={circleStyle}
                                    title={step.replace(/_/g, ' ')}
                                  >
                                    {isCompleted ? '✓' : isCurrent ? idx + 1 : ''}
                                  </div>
                                  {/* Connector line (except after last circle) */}
                                  {idx < statusSteps.length - 1 && (
                                    <div
                                      className="h-1 w-8 mx-1"
                                      style={{ backgroundColor: connectorColor, borderRadius: 2 }}
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] mt-1" style={labelStyle}>{step.replace(/_/g, ' ')}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                      {cartItems.map((item: any) => (
                        <div key={item.product.product_id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img src={item.product.image_url} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-gray-800">{item.product.name}</p>
                              <p className="text-sm">KSh {item.product.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product.product_id, -1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.product_id, 1)}
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
                          <span>KSh {cartTotal.toFixed(2)}</span>
                        </div>
                        <button className="w-full mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => navigate({ to: '/customer/cart' })}>
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="text-gray-400 mx-auto mb-4" size={48} />
                      <p className="text-gray-600">Your cart is empty</p>
                      <button className="mt-3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      onClick={() => navigate({ to: '/products' })}>
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
                  <a href="/customer/payments" className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ShoppingBagIcon className="text-green-600" size={20} />
                    <span>Continue Shopping</span>
                  </a>
                  <a href="/customer/cart" className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <ShoppingBasketIcon className="text-purple-600" size={20} />
                    <span>My Cart</span>
                  </a>
                  <a href="/customer/my-orders" className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Truck className="text-blue-600" size={20} />
                    <span>Track Order</span>
                  </a>
                  <a href="/customer/wishlist" className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="text-pink-600" size={20} />
                    <span>View Favorites</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}