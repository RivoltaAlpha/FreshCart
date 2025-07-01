import { createFileRoute } from '@tanstack/react-router'
import { Package, ShoppingCart, TrendingUp, DollarSign, AlertCircle, ClipboardCheckIcon, Settings, Bell, Search, Plus, Edit, Eye, } from 'lucide-react'

export const Route = createFileRoute('/store/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const stats = [
    { title: 'Total Products', value: '156', color: '#00A7B3', icon: Package },
    { title: 'Pending Orders', value: '8', color: '#005A61', icon: ShoppingCart },
    { title: 'Today\'s Revenue', value: '$1,235', color: '#516E89', icon: DollarSign },
    { title: 'Low Stock Items', value: '12', color: '#516E89', icon: AlertCircle },
  ]

  const recentOrders = [
    {
      id: 'ORD001',
      customer: 'John Doe',
      items: 5,
      total: '$45.50',
      status: 'pending',
      time: '10 min ago'
    },
    {
      id: 'ORD002',
      customer: 'Jane Smith',
      items: 3,
      total: '$28.75',
      status: 'preparing',
      time: '15 min ago'
    },
    {
      id: 'ORD003',
      customer: 'Mike Johnson',
      items: 8,
      total: '$67.20',
      status: 'ready',
      time: '22 min ago'
    },
    {
      id: 'ORD004',
      customer: 'Sarah Wilson',
      items: 2,
      total: '$15.30',
      status: 'completed',
      time: '35 min ago'
    },
  ]

  const lowStockItems = [
    { name: 'Organic Bananas', stock: 5, threshold: 20, category: 'Fruits' },
    { name: 'Whole Milk', stock: 8, threshold: 25, category: 'Dairy' },
    { name: 'Bread Rolls', stock: 3, threshold: 15, category: 'Bakery' },
    { name: 'Chicken Breast', stock: 2, threshold: 10, category: 'Meat' },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Store Dashboard</h1>
              <p className="text-gray-600">Manage your store, products, and orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  5
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Quick Actions */}
          <div className="my-8 bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="text-indigo-600" size={24} />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Add Product</p>
                  <p className="text-sm text-gray-600">Add new item to store</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ClipboardCheckIcon className="text-green-600" size={24} />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Update Inventory</p>
                  <p className="text-sm text-gray-600">Manage stock levels</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <TrendingUp className="text-blue-600" size={24} />
                <div className="text-left">
                  <p className="font-medium text-gray-800">View Analytics</p>
                  <p className="text-sm text-gray-600">Sales performance</p>
                </div>
              </button>
              <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="text-purple-600" size={24} />
                <div className="text-left">
                  <p className="font-medium text-gray-800">Store Settings</p>
                  <p className="text-sm text-gray-600">Configure store</p>
                </div>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-[${stat.color}] rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon size={32} className="text-white/80" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Recent Orders</h2>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="p-6 space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">#{order.id}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.items} items • {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{order.total}</p>
                      <div className="flex space-x-1 mt-2">
                        <button className="p-1 text-gray-400 hover:text-indigo-600">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-indigo-600">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Low Stock Alert</h2>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Manage Inventory
                </button>
              </div>

              <div className="p-6 space-y-4">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(item.stock / item.threshold) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.stock}/{item.threshold}
                        </span>
                      </div>
                    </div>
                    <button className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-colors text-sm">
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}