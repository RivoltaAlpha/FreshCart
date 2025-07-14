import { useDeliveriesForDriver } from '@/hooks/useDeliveries'
import { loggedInUser } from '@/store/auth'
import type { Delivery } from '@/types/delivery'
import { createFileRoute } from '@tanstack/react-router'
import { Package, DollarSign, Bell, Search, CheckCircle, Eye, Edit } from 'lucide-react'

export const Route = createFileRoute('/driver/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const stats = [
    { title: 'Active Orders', value: '3', color: '#00A7B3', icon: Package },
    { title: 'Completed Today', value: '12', color: '#005A61', icon: CheckCircle },
    { title: 'Total Earnings', value: '$245', color: '#516E89', icon: DollarSign },
  ]
  const user = loggedInUser();
  const { data: alldeliveries } = useDeliveriesForDriver(user?.user_id ? parseInt(user.user_id) : 0);

  const delivery: Delivery[] | undefined = alldeliveries?.filter(
    (delivery: Delivery) => delivery.delivery_status === 'assigned' || delivery.delivery_status === 'picked_up' || delivery.delivery_status === 'in_transit'
  );

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
              {(delivery && delivery.length > 0) ? (
                delivery.map((delivery: any) => {
                  // const customer = delivery.user;
                  // const customerProfile = customer?.profile;
                  // const defaultAddress = customerProfile?.addresses?.find((addr: any) => addr.isDefault) || customerProfile?.addresses?.[0];
                  // // Get order info
                  // const order = delivery.order;
                  return (
                    <div key={delivery.delivery_id || delivery.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-fresh-primary">#{delivery.order?.order_number || delivery.delivery_id || delivery.id}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${delivery.order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            delivery.order?.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                              delivery.order?.status === 'ready' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-fresh-primary'
                            }`}>
                            {delivery.order?.status ? delivery.order.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                          </span>
                        </div>
                        <p className="text-white">{delivery.user?.profile?.first_name} {delivery.user?.profile?.last_name}</p>
                        <p className="text-sm text-gray-500">{delivery.order?.items?.length || 0} items • {delivery.order?.created_at ? new Date(delivery.order.created_at).toLocaleTimeString() : '-'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">KSh {delivery.order?.total_amount || delivery.total}</p>
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
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>No active deliveries found.</p>
                </div>
              )}

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