import { createFileRoute } from '@tanstack/react-router'
import { Users, Package, Warehouse, ShoppingCart, Clock, FileText, Bell, Search } from 'lucide-react'
import { authStore } from '@/store/auth'
import { useUsers } from '@/hooks/useUser'
import { useStores, useUnverifiedStores } from '@/hooks/useStore'
import { useProducts } from '@/hooks/useProducts'
import { useOrders } from '@/hooks/useOrders'
import { useDeliveries } from '@/hooks/useDeliveries'
import OrdersLineChart from '@/components/ordersChart'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = authStore.state.user
  const { stores } = useStores()
  const { data: users } = useUsers()
  const { data: products } = useProducts()
  const { data: orders } = useOrders()
  const { data: deliveries } = useDeliveries()
  const { data: unverifiedStores } = useUnverifiedStores()
  const totalUsers = users?.length || 0
  const totalStores = stores?.length || 0
  const totalProducts = products?.length || 0
  const totalOrders = orders?.length || 0
  const totalDeliveries = deliveries?.length || 0
  const totalUnverifiedStores = unverifiedStores?.length || 0
  const ordersData: any = useOrders()

  const stats = [
    { title: 'Total Users', value: totalUsers, color: 'bg-[#30739C]', icon: Users },
    { title: 'Products Listed', value: totalProducts, color: 'bg-[#670787]', icon: Package },
    { title: 'Stores', value: totalStores, color: 'bg-[#0C0166]', icon: Warehouse },
    { title: 'Orders Today', value: totalOrders, color: 'bg-[#1A74B9]', icon: ShoppingCart },
    { title: 'Pending Approvals', value: totalUnverifiedStores, color: 'bg-[#015A6B]', icon: Clock },
    { title: 'Deliveries', value: totalDeliveries, color: 'bg-[#731CDE]', icon: FileText },
  ]


  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back {user.first_name} {user.last_name}! Here's an overview of your system.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015A6B]"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.color} rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon size={40} className="text-white/80" />
                </div>
              </div>
            ))}
          </div>

          {/* Orders Chart */}
          <div className="p-6">
            <OrdersLineChart orders={ordersData.data} />
          </div>

        </main>
      </div>
    </div>
  )
}