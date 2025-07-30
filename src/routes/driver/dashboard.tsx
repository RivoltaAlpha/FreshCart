import DriverStatusToggle from '@/components/StatusToggle'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useDeliveriesForDriver } from '@/hooks/useDeliveries'
import { loggedInUser } from '@/store/auth'
import type { Delivery } from '@/types/delivery'
import { createFileRoute } from '@tanstack/react-router'
import { Package, DollarSign, Bell, CheckCircle, Eye, Edit } from 'lucide-react'

export const Route = createFileRoute('/driver/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = loggedInUser();
  const { data: alldeliveries } = useDeliveriesForDriver(user?.user_id ? parseInt(user.user_id) : 0);
  console.log('alldeliveries', alldeliveries);
  const completedDeliveries = alldeliveries?.filter((delivery: Delivery) => delivery.delivery_status === 'delivered').length || 0;
  const activeDeliveries = alldeliveries?.filter(
    (delivery: Delivery) =>
      delivery.delivery_status === 'assigned' ||
      delivery.delivery_status === 'picked_up' ||
      delivery.delivery_status === 'in_transit'
  ).length || 0;

  // total payment from delivery
  const totalDeliveredPayment = alldeliveries
    ?.filter((delivery: Delivery) => delivery.delivery_status === 'delivered')
    .reduce((total: number, delivery: Delivery) => total + parseFloat(delivery.delivery_fee || '0'), 0) || 0;

  const stats = [
    { title: 'Active Orders', value: activeDeliveries, color: '#00A7B3', icon: Package },
    { title: 'Completed Deliveries', value: completedDeliveries, color: '#005A61', icon: CheckCircle },
    { title: 'Total Earnings', value: `KES ${totalDeliveredPayment}`, color: '#516E89', icon: DollarSign },
  ];

  const deliveries: Delivery[] = alldeliveries || [];
  const deliveriesToShow: Delivery[] | undefined = deliveries?.filter(
    (delivery: Delivery) => delivery.delivery_status === 'assigned' || delivery.delivery_status === 'picked_up' || delivery.delivery_status === 'in_transit'
  );


  return (
    <div className="flex flex-col h-screen bg-background p-4">
      {/* Main Content */}
      {/* Header */}
      <header className="bg-searchbar rounded-2xl shadow-sm border-b m-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fresh-secondary">Driver Dashboard</h1>
            <p className="text-text">Manage your deliveries and track your earnings</p>
          </div>
          <div className="flex items-center space-x-4">
            <DriverStatusToggle driverId={user?.user_id} is_available={!!user?.is_available} />
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 lg:p-6">
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
        <div className="bg-searchbar rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-text">Orders Awaiting Pickup</h2>
          </div>

          <div className="p-6 space-y-4">
            {deliveriesToShow.length > 0 ? (
              deliveriesToShow.map((delivery: Delivery) => (
                <div key={delivery.delivery_id || delivery.delivery_id} className="flex items-center justify-between p-4 border-b border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-fresh-primary">
                        #{delivery.order?.order_number || delivery.delivery_id || delivery.delivery_id}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${delivery.delivery_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        delivery.delivery_status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          delivery.delivery_status === 'picked_up' ? 'bg-green-100 text-green-800' :
                            delivery.delivery_status === 'delivered' ? 'bg-gray-100 text-fresh-primary' :
                              'bg-gray-100 text-fresh-primary'
                        }`}>
                        {delivery.delivery_status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <p className="text-text">{delivery.user?.profile?.first_name} {delivery.user?.profile?.last_name}</p>
                    <p className="text-sm text-gray-500">Packaged at {delivery.order?.created_at ? new Date(delivery.order.created_at).toLocaleTimeString() : '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">KSh {delivery.order?.total_amount || delivery.delivery_fee}</p>
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
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No active deliveries found.</p>
              </div>
            )}

          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-searchbar rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-fresh-secondary">Orders Completed</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fresh-secondary">Distance Traveled</span>
                <span className="font-medium">48.3 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fresh-secondary">Active Hours</span>
                <span className="font-medium">6h 30m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fresh-secondary">Earnings</span>
                <span className="font-medium text-green-600">$245.00</span>
              </div>
            </div>
          </div>

          <div className="bg-searchbar rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                View Navigation
              </button>
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                Report Issue
              </button>
              <button className="w-full border border-gray-300 text-text py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Take Break
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}