import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ShoppingCart, Clock, CheckCircle, Truck, XCircle, TrendingUp, Calendar, BarChart as BarChartIcon } from 'lucide-react'
import { getAllOrdersAnalytics } from '@/services/orderService'
import { useEffect, useState } from 'react'

interface OrderMonthlyTrend {
    month: string
    count: string
}

interface OrderAnalyticsData {
    total_orders: number
    pending_orders: number
    confirmed_orders: number
    delivered_orders: number
    cancelled_orders: number
    preparing_orders: number
    ready_for_pickup_orders: number
    in_transit_orders: number
    average_order_value: number
    monthly_trends: OrderMonthlyTrend[]
}

function OrdersAnalytics() {
    const [data, setData] = useState<OrderAnalyticsData | null>(null)

    useEffect(() => {
        getAllOrdersAnalytics().then(setData)
    }, [])

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading order analytics...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Enhanced date parsing to handle ISO timestamps and other formats
    const monthlyData = data.monthly_trends.map(trend => {
        let date;
        try {
            // Handle ISO timestamp, YYYY-MM, or YYYY-MM-DD formats
            date = new Date(trend.month);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                // Try alternative parsing for YYYY-MM format
                const dateStr = trend.month.includes('-') && trend.month.split('-').length === 2
                    ? `${trend.month}-01`
                    : trend.month;
                date = new Date(dateStr);

                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date');
                }
            }
        } catch (error) {
            console.warn('Date parsing failed for:', trend.month);
            date = new Date(); // Fallback to current date
        }

        return {
            month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
            count: parseInt(trend.count) || 0,
            fullMonth: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
            originalMonth: trend.month
        };
    }).filter(item => item.count > 0); // Filter out any items with 0 count

    // Status distribution data for pie chart
    const statusData = [
        { name: 'Delivered', value: data.delivered_orders, color: '#10B981' },      // green
        { name: 'Confirmed', value: data.confirmed_orders, color: '#3B82F6' },      // blue
        { name: 'Pending', value: data.pending_orders, color: '#F59E0B' },          // yellow
        { name: 'Preparing', value: data.preparing_orders, color: '#8B5CF6' },      // purple
        { name: 'Ready for Pickup', value: data.ready_for_pickup_orders, color: '#EC4899' }, // pink
        { name: 'In Transit', value: data.in_transit_orders, color: '#6366F1' },    // indigo
        { name: 'Cancelled', value: data.cancelled_orders, color: '#EF4444' }       // red
    ].filter(item => item.value > 0)

    const deliveryRate = data.total_orders > 0 ? ((data.delivered_orders / data.total_orders) * 100).toFixed(1) : '0'
    const cancellationRate = data.total_orders > 0 ? ((data.cancelled_orders / data.total_orders) * 100).toFixed(1) : '0'

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.fullMonth || label}</p>
                    <p className="text-blue-600">
                        Orders: {payload[0].value}
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
                    <h1 className="text-3xl font-bold text-gray-900">Order Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-2">Comprehensive overview of order performance and trends</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900">{data.total_orders}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-gray-900">{data.pending_orders}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                <p className="text-3xl font-bold text-gray-900">{data.confirmed_orders}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Delivered</p>
                                <p className="text-3xl font-bold text-gray-900">{data.delivered_orders}</p>
                            </div>
                            <Truck className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                                <p className="text-3xl font-bold text-gray-900">{data.cancelled_orders}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Add Average Order Value Card */}
                {/* <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                            <p className="text-3xl font-bold text-gray-900">KES {data.average_order_value.toLocaleString()}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-500" />
                    </div>
                </div> */}

                {/* Summary Insights */}
                <div className="bg-white rounded-lg shadow-md p-6 my-10">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Delivery Rate</h4>
                            <p className="text-sm text-gray-600">
                                {deliveryRate}% of orders successfully delivered
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Cancellation Rate</h4>
                            <p className="text-sm text-gray-600">
                                {cancellationRate}% cancellation rate
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Peak Month</h4>
                            <p className="text-sm text-gray-600">
                                {monthlyData.length > 0 ?
                                    monthlyData.reduce((max, current) => current.count > max.count ? current : max).month
                                    : 'N/A'
                                } had the highest orders
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Monthly Trends Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Order Trends</h3>
                        {monthlyData.length === 0 ? (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No monthly trend data available</p>
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        fontSize={12}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Order Status Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                        {statusData.length === 0 ? (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                    <p>No order status data available</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={1}
                                            dataKey="value"
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center mt-4 gap-3">
                                    {statusData.map((entry, index) => (
                                        <div key={index} className="flex items-center">
                                            <div
                                                className="w-3 h-3 rounded-full mr-2"
                                                style={{ backgroundColor: entry.color }}
                                            ></div>
                                            <span className="text-xs text-gray-600">
                                                {entry.name}: {entry.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Monthly Bar Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Order Volume</h3>
                    {monthlyData.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <BarChartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No monthly volume data available</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" fontSize={12} />
                                <YAxis allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#189AB4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    )
}

export default OrdersAnalytics