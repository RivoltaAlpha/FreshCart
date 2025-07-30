import OrdersLineChart from '@/components/ordersChart'
import { useStoreOrders } from '@/hooks/useOrders'
import { useStoreProducts } from '@/hooks/useProducts'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Package, ShoppingCart, TrendingUp, DollarSign, AlertCircle, ClipboardCheckIcon, Settings, Plus } from 'lucide-react'

export const Route = createFileRoute('/store/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = localStorage.getItem("currentStore") || '';
  const storeId = store ? JSON.parse(store).store_id : 0;
  const products = useStoreProducts(storeId);
  const ordersData: any = useStoreOrders(storeId)
  const pendingOrders = ordersData.data?.length;
  const stats = [
    { title: 'Total Products', value: products.data.length, color: '#00A7B3', icon: Package },
    { title: ' Orders', value: pendingOrders, color: '#005A61', icon: ShoppingCart },
    { title: 'Today\'s Revenue', value: 'Ksh 4,632', color: '#516E89', icon: DollarSign },
    { title: 'Low Stock Items', value: '0', color: '#516E89', icon: AlertCircle },
  ]

  return (
    <div className="flex h-screen rounded-2xl">
      <div className="flex-1 flex flex-col  ">
        {/* Quick Actions */}
        <div className="rounded-xl my-2 bg-card shadow-sm">
          <div className="px-4 py-4 border-b">
            <h2 className="text-xl font-semibold text-fresh-primary">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/store/create-product" className="flex items-center space-x-3 p-4 border-b border-l rounded-lg hover:bg-searchbar transition-colors">
              <Plus className="text-indigo-600" size={24} />
              <div className="text-left">
                <p className="font-medium text-fresh-primary">Add Product</p>
                <p className="text-sm ">Add new item to store</p>
              </div>
            </Link >
            <Link to="/store/inventories" className="flex items-center space-x-3 p-4 border-b border-l border-gray-200 rounded-lg hover:bg-searchbar transition-colors">
              <ClipboardCheckIcon className="text-green-600" size={24} />
              <div className="text-left">
                <p className="font-medium text-fresh-primary">Update Inventory</p>
                <p className="text-sm ">Manage stock levels</p>
              </div>
            </Link >
            <Link to="/store/analytics" className="flex items-center space-x-3 p-4 border-b border-l border-gray-200 rounded-lg hover:bg-searchbar transition-colors">
              <TrendingUp className="text-blue-600" size={24} />
              <div className="text-left">
                <p className="font-medium text-fresh-primary">View Analytics</p>
                <p className="text-sm ">Sales performance</p>
              </div>
            </Link >
            <Link to="/store/settings" className="flex items-center space-x-3 p-4 border-b border-l border-gray-200 rounded-lg hover:bg-searchbar transition-colors">
              <Settings className="text-purple-600" size={24} />
              <div className="text-left">
                <p className="font-medium text-fresh-primary">Store Settings</p>
                <p className="text-sm ">Configure store</p>
              </div>
            </Link >
          </div>
        </div>
        <main className="flex-1 lg:p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-[${stat.color}] rounded-xl p-6 text-white`}>
                <div className="flex items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div>
                    <p className="text-white/80 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon size={32} className="text-white/80" />
                </div>
              </div>
            ))}
          </div>

          <div>
            <OrdersLineChart orders={ordersData.data} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Recent Orders */}
            <div className="bg-background rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-fresh-primary">Recent Orders</h2>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="p-6 space-y-6">
                {(ordersData?.data ?? []).map((order: any) => (
                  <div key={order.order_id} className="flex bg-searchbar items-center justify-between p-4 border-b border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-fresh-primary">#{order.order_number}</h3>
                        <span className={`px-2 py-1 text-xs text-text font-medium rounded-full ${order.status === 'pending' ? 'bg-blue-200 text-yellow-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              'bg-blue-900 text-white'
                          }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <p>
                        {order.user?.profile
                          ? `${order.user.profile.first_name} ${order.user.profile.last_name}`
                          : order.user?.email || 'Unknown Customer'}
                      </p>
                      <p className="text-sm text-fresh-secondary">
                        {order.items.map((item: any) => item.product?.name || '').join(', ')} • {order.created_at && new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">KES {order.total_amount}</p>
                    </div>
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