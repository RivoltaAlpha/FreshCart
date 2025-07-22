import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Store, DollarSign, ShoppingCart } from 'lucide-react'
import { getAllStoresAnalytics } from '@/services/storeService'
import type { StoreOrderVolume, StoreRevenue, StoresAnalytics } from '@/types/store'



const analyticsData: StoresAnalytics = await getAllStoresAnalytics()
function StoreAnalytics() {
    // Process data for charts
    const revenueData = analyticsData.storeRevenue
        .filter((store) => store.totalRevenue !== null)
        .map((store) => ({
            name: store.store_name.length > 15
                ? store.store_name.substring(0, 15) + '...'
                : store.store_name,
            revenue: parseFloat(store.totalRevenue || '0'),
            fullName: store.store_name
        }))
        .sort((a, b) => b.revenue - a.revenue)

    const totalRevenue = revenueData.reduce((sum, store) => sum + store.revenue, 0)

    const verificationData = [
        { name: 'Verified', value: analyticsData.verifiedStores, color: '#10B981' },
        { name: 'Unverified', value: analyticsData.unverifiedStores, color: '#F59E0B' }
    ]

    const orderVolumeData = analyticsData.storeOrderVolume
        .filter((store) => parseInt(store.ordercount) > 0)
        .map((store) => ({
            name: store.store_name.length > 15
                ? store.store_name.substring(0, 15) + '...'
                : store.store_name,
            orders: parseInt(store.ordercount),
            fullName: store.store_name
        }))
        .sort((a, b) => b.orders - a.orders)

    const totalOrders = orderVolumeData.reduce((sum, store) => sum + store.orders, 0)

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.fullName || label}</p>
                    <p className="text-blue-600">
                        {payload[0].dataKey === 'revenue'
                            ? `Revenue: KES ${payload[0].value.toLocaleString()}`
                            : `Orders: ${payload[0].value}`}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Store Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-2">Comprehensive view of store performance and metrics</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                                <p className="text-3xl font-bold text-gray-900">{analyticsData.totalStores}</p>
                            </div>
                            <Store className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-teal-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900">KES {totalRevenue.toLocaleString()}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-teal-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Top Performer</p>
                                <p className="text-lg font-bold text-gray-900">{analyticsData.topPerformingStore.store_name}</p>
                                <p className="text-sm text-gray-500">{analyticsData.topPerformingStore.orderCount} orders</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Revenue Performance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={12}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Store Verification Status */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Verification Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={verificationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {verificationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center mt-4 space-x-4">
                            {verificationData.map((entry, index) => (
                                <div key={index} className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-sm text-gray-600">
                                        {entry.name}: {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order Volume Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Volume by Store</h3>
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Stores with active orders: {orderVolumeData.length}</p>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={orderVolumeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                fontSize={12}
                            />
                            <YAxis
                                label={{ value: 'Number of Orders', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Store Performance Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Store Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Store Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue (KES)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analyticsData.storeRevenue.map((store: StoreRevenue) => {
                                    const orderData = analyticsData.storeOrderVolume.find(
                                        (order: StoreOrderVolume) => order.store_store_id === store.store_store_id
                                    )
                                    const hasRevenue = store.totalRevenue !== null

                                    return (
                                        <tr key={store.store_store_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {store.store_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {hasRevenue ? `${parseFloat(store.totalRevenue ?? '0').toLocaleString()}` : 'No data'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {orderData?.ordercount || '0'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${hasRevenue
                                                    ? 'bg-teal-100 text-teal-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {hasRevenue ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StoreAnalytics