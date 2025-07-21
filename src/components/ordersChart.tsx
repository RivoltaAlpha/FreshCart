import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { CustomerOrder } from '@/types/types';

const OrdersLineChart = ({ orders }: { orders: CustomerOrder[] | undefined }) => {
    // Process orders data for the chart
    const chartData = useMemo(() => {
        // Ensure orders is an array
        let ordersArray = [];
        if (Array.isArray(orders)) {
            ordersArray = orders;
        } else if (orders && typeof orders === 'object') {
            // Handle case where orders might be wrapped in an object
            if ('data' in orders && Array.isArray((orders as any).data)) {
                ordersArray = (orders as any).data;
            } else if ('orders' in orders && Array.isArray((orders as any).orders)) {
                ordersArray = (orders as any).orders;
            } else {
                ordersArray = [orders];
            }
        }

        if (!ordersArray || ordersArray.length === 0) return [];

        console.log('Orders array:', ordersArray); // Debug log

        interface DailyOrderData {
            date: string;
            orderCount: number;
            totalAmount: number;
            confirmedCount: number;
            cancelledCount: number;
            deliveredCount: number;
        }

        // Group orders by date
        const dailyData = ordersArray.reduce((acc: any, order: CustomerOrder) => {
            const orderData = order;
            const date = new Date(orderData.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD format

            if (!acc[date]) {
                acc[date] = {
                    date,
                    orderCount: 0,
                    totalAmount: 0,
                    confirmedCount: 0,
                    cancelledCount: 0,
                    deliveredCount: 0
                };
            }

            acc[date].orderCount += 1;
            acc[date].totalAmount += parseFloat((orderData.total_amount ?? '0').toString());

            // Count by status
            switch (orderData.status) {
                case 'confirmed':
                    acc[date].confirmedCount += 1;
                    break;
                case 'cancelled':
                    acc[date].cancelledCount += 1;
                    break;
                case 'delivered':
                    acc[date].deliveredCount += 1;
                    break;
            }

            return acc;
        }, {});

        // Convert to array and sort by date
        return Object.values(dailyData)
            .sort((a, b) => {
                const dateA = new Date((a as DailyOrderData).date).getTime();
                const dateB = new Date((b as DailyOrderData).date).getTime();
                return dateA - dateB;
            })
            .map(item => ({
                ...(item as Record<string, any>),
                displayDate: new Date((item as DailyOrderData).date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })
            }));
    }, [orders]);

    // Calculate summary stats
    const stats = useMemo(() => {
        // Ensure orders is an array
        let ordersArray = [];
        if (Array.isArray(orders)) {
            ordersArray = orders;
        } else if (orders && typeof orders === 'object') {
            if ('data' in orders && Array.isArray((orders as any).data)) {
                ordersArray = (orders as any).data;
            } else if ('orders' in orders && Array.isArray((orders as any).orders)) {
                ordersArray = (orders as any).orders;
            } else {
                ordersArray = [orders];
            }
        }

        if (!ordersArray || ordersArray.length === 0) return { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 };

        const totalOrders = ordersArray.length;
        interface OrderData {
            total_amount?: string | number;
            [key: string]: any;
        }
        const totalRevenue = ordersArray.reduce((sum: number, order: OrderData) => {
            const orderData = order;
            const amount = orderData.total_amount;
            const amountNumber = typeof amount === 'number' ? amount : parseFloat(amount || '0');
            return sum + (isNaN(amountNumber) ? 0 : amountNumber);
        }, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalOrders,
            totalRevenue,
            avgOrderValue
        };
    }, [orders]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: { active: boolean; payload: any[]; label: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="">{entry.name}:</span>
                            <span className="font-medium text-gray-900">
                                {entry.name === 'Total Amount'
                                    ? `KES ${entry.value.toLocaleString()}`
                                    : entry.value
                                }
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (
        !orders ||
        (Array.isArray(orders) && orders.length === 0) ||
        (
            !Array.isArray(orders) &&
            (
                (typeof orders !== 'object') ||
                (
                    !('data' in (orders as object)) &&
                    !('orders' in (orders as object))
                )
            )
        )
    ) {
        return (
            <div className="bg-white rounded-xl shadow-sm">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Orders Payments Overview</h2>
                </div>
                <div className="p-6">
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Package className="w-12 h-12 mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No payments found</p>
                        <p className="text-sm">Payment data will appear here once available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[#145DA0] rounded-2xl shadow-md my-10 p-0">
                <div className="px-8 pt-8 pb-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Payment Analytics</h2>
                    </div>
                </div>
                <div className="px-8 pb-4 grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-[#1e4c7b]">
                    <div>
                        <div className="text-[#b6e0fe] text-sm">Income</div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-white">
                                KES {stats.totalRevenue.toLocaleString()}
                            </span>
                            <span className="bg-[#052c4f] text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                                +0.02%
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[#b6e0fe] text-sm">Orders Made</div>
                        <div className="flex items-center gap-3">
                            <Package className="w-10 h-10 text-white" />
                            <span className="text-3xl font-bold text-white">Total: {stats.totalOrders} </span>
                            <span className="bg-[#052c4f] text-orange-300 px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                                <ArrowDownRight className="w-4 h-4 text-orange-300" />
                                -0.02%
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[#b6e0fe] text-sm">Balance</div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-white">Avg: KES {stats.avgOrderValue.toFixed(0)}</span>
                            <span className="bg-[#052c4f] text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold">
                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                                +0.02%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="p-8 pt-4">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="displayDate"
                                    tick={{ fontSize: 12 }}
                                    stroke="#b6e0fe"
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 12 }}
                                    stroke="#b6e0fe"
                                    label={{ value: 'Order Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12 }}
                                    stroke="#b6e0fe"
                                    label={{ value: 'Amount (KES)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                                />
                                <Tooltip content={<CustomTooltip
                                    active={false}
                                    payload={[]}
                                    label=""
                                />} />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="line"
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="orderCount"
                                    stroke="#b6e0fe"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#b6e0fe', strokeWidth: 2, fill: '#b6e0fe' }}
                                    name="Order Count"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="totalAmount"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                                    name="Total Amount"
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="confirmedCount"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ fill: '#f59e0b', strokeWidth: 1, r: 3 }}
                                    strokeDasharray="5 5"
                                    name="Confirmed Orders"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="py-6 pt-4 border-t border-gray-100 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{stats.totalOrders}</div>
                            <div className="text-sm ">Total Orders</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                KES {stats.totalRevenue.toLocaleString()}
                            </div>
                            <div className="text-sm ">Total Revenue</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                KES {stats.avgOrderValue.toFixed(0)}
                            </div>
                            <div className="text-sm ">Average Order Value</div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default OrdersLineChart;