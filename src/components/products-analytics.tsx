import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, Star, TrendingUp, ShoppingBag, Award, BarChart3 } from 'lucide-react'
import { getAllProductsAnalytics } from '@/services/productService'
import type { ProductAnalyticsData, ProductRating, TopProduct } from '@/types/store'
import { useEffect, useState } from 'react'


function ProductAnalytics() {
    const [productAnalyticsData, setProductAnalyticsData] = useState<ProductAnalyticsData | null>(null)

    useEffect(() => {
        getAllProductsAnalytics().then(setProductAnalyticsData)
    }, [])

    if (!productAnalyticsData) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading product analytics...</p>
                </div>
            </div>
        )
    }

    const categoryData = productAnalyticsData.topCategories
        .filter(cat => cat.total_sales !== null)
        .map(cat => ({
            name: cat.category_name,
            sales: parseFloat(cat.total_sales || '0'),
            id: cat.category_category_id
        }))
        .sort((a, b) => b.sales - a.sales)

    const totalCategorySales = categoryData.reduce((sum, cat) => sum + cat.sales, 0)

    const ratingsData = productAnalyticsData.productRatings.map((product: ProductRating) => ({
        name: product.product_name.length > 20
            ? product.product_name.substring(0, 20) + '...'
            : product.product_name,
        rating: parseFloat(product.average_rating),
        reviews: parseInt(product.review_count),
        fullName: product.product_name,
        id: product.product_product_id
    }))

    const topProductsData = productAnalyticsData.topProducts.map((product: TopProduct) => ({
        name: product.product_name,
        quantity: parseInt(product.totalquantity),
        fullName: product.product_name,
        id: product.product_id
    }))

    const totalProductsSold = topProductsData.reduce((sum, product) => sum + product.quantity, 0)

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

    const averageRating = ratingsData.length > 0
        ? ratingsData.reduce((sum, product) => sum + product.rating, 0) / ratingsData.length
        : 0

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium">{data.fullName || label}</p>
                    <p className="text-blue-600">
                        {payload[0].dataKey === 'sales' && `Sales: KES ${payload[0].value.toLocaleString()}`}
                        {payload[0].dataKey === 'quantity' && `Quantity Sold: ${payload[0].value}`}
                        {payload[0].dataKey === 'rating' && `Rating: ${payload[0].value}/5 (${data.reviews} reviews)`}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Product Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-2">Insights into product performance, categories, and customer ratings</p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Categories</p>
                                <p className="text-3xl font-bold text-gray-900">{categoryData.length}</p>
                                <p className="text-xs text-gray-500">of {productAnalyticsData.topCategories.length} total</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Category Sales</p>
                                <p className="text-3xl font-bold text-gray-900">KES {totalCategorySales.toLocaleString()}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Products Sold</p>
                                <p className="text-3xl font-bold text-gray-900">{totalProductsSold}</p>
                                <p className="text-xs text-gray-500">total quantity</p>
                            </div>
                            <ShoppingBag className="h-8 w-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                                <p className="text-xs text-gray-500">out of 5.0</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Summary Insights */}
                <div className="bg-white rounded-lg shadow-md p-6 my-10">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Top Category</h4>
                            <p className="text-sm text-gray-600">
                                {categoryData[0]?.name} leads with KES {categoryData[0]?.sales.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                                <Award className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Best Selling Product</h4>
                            <p className="text-sm text-gray-600">
                                {topProductsData[0]?.name} with {topProductsData[0]?.quantity} units sold
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-2">
                                <Star className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h4 className="font-medium text-gray-900">Customer Satisfaction</h4>
                            <p className="text-sm text-gray-600">
                                {averageRating.toFixed(1)}/5.0 average rating across all products
                            </p>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Category Sales Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData}>
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
                                <Bar dataKey="sales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Distribution Pie Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Sales Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="sales"
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center mt-4 gap-2">
                            {categoryData.map((entry, index) => (
                                <div key={index} className="flex items-center">
                                    <div
                                        className="w-3 h-3 rounded-full mr-2"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    ></div>
                                    <span className="text-xs text-gray-600">
                                        {entry.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Products and Ratings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Products by Quantity */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Quantity Sold</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Top {topProductsData.length} products by sales volume</p>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={topProductsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    fontSize={11}
                                />
                                <YAxis
                                    label={{ value: 'Quantity Sold', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="quantity" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Product Ratings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Ratings</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={ratingsData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={11}
                                />
                                <YAxis domain={[0, 5]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="rating" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default ProductAnalytics