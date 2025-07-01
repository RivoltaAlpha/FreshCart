import { createFileRoute } from '@tanstack/react-router'
import { Package, MapPin, DollarSign, Navigation, Bell, Search, Phone, CheckCircle } from 'lucide-react'

export const Route = createFileRoute('/driver/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const stats = [
    { title: 'Active Orders', value: '3', color: '#00A7B3', icon: Package },
    { title: 'Completed Today', value: '12', color: '#005A61', icon: CheckCircle },
    { title: 'Total Earnings', value: '$245', color: '#516E89', icon: DollarSign },
  ]

  const activeOrders = [
    {
      id: 'ORD001',
      customer: 'Tiffany Nyawira ',
      address: '123 Main St, Downtown',
      phone: '+1 234-567-8900',
      items: 15,
      amount: '$85.50',
      distance: '2.3 km',
      status: 'picked_up'
    },
    {
      id: 'ORD002',
      customer: 'Mwaniki Nyawira ',
      address: '456 Oak Ave, Uptown',
      phone: '+1 234-567-8901',
      items: 8,
      amount: '$42.30',
      distance: '1.8 km',
      status: 'ready_pickup'
    },
    {
      id: 'ORD003',
      customer: 'Nyawira Wambui',
      address: '789 Pine Blvd, Suburb',
      phone: '+1 234-567-8902',
      items: 22,
      amount: '$120.75',
      distance: '4.1 km',
      status: 'preparing'
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
              <p className="text-gray-600">Manage your deliveries and track your earnings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* Active Orders */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Active Orders</h2>
            </div>

            <div className="p-6 space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">#{order.id}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'picked_up' ? 'bg-[#005A61] text-white' :
                            order.status === 'ready_pickup' ? 'bg-[#516E89] text-white' :
                              'bg-[#00A7B3] text-white'
                          }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-gray-900">{order.customer}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <div className="flex items-center space-x-1">
                          <MapPin size={16} />
                          <span>{order.address}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone size={16} />
                          <span>{order.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{order.amount}</p>
                      <p className="text-sm text-gray-600">{order.items} items</p>
                      <p className="text-sm text-gray-600">{order.distance}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {order.status === 'ready_pickup' && (
                      <button className="flex-1 bg-[#516E89] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Pick Up Order
                      </button>
                    )}
                    {order.status === 'picked_up' && (
                      <button className="flex-1 bg-[#00A7B3] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                        Mark as Delivered
                      </button>
                    )}
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Navigation size={16} />
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Phone size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Orders Completed</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance Traveled</span>
                  <span className="font-medium">48.3 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Hours</span>
                  <span className="font-medium">6h 30m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Earnings</span>
                  <span className="font-medium text-green-600">$245.00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                  View Navigation
                </button>
                <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                  Report Issue
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Take Break
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}