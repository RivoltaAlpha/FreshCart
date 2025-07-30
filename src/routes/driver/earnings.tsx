import { useDeliveriesForDriver } from '@/hooks/useDeliveries';
import { loggedInUser } from '@/store/auth';
import type { Delivery } from '@/types/delivery';
import { createFileRoute } from '@tanstack/react-router'
import  { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Calendar, DollarSign, Package, Clock, TrendingUp, Target } from 'lucide-react';

export const Route = createFileRoute('/driver/earnings')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = loggedInUser();
  const { data: alldeliveries } = useDeliveriesForDriver(user?.user_id ? parseInt(user.user_id) : 0);
  const analysisData = useMemo(() => {
    if (!alldeliveries || alldeliveries.length === 0) {
      return {
        totalEarnings: 0,
        deliveredCount: 0,
        pendingCount: 0,
        avgDeliveryFee: 0,
        dailyEarnings: [],
        statusDistribution: [],
        performanceMetrics: [],
        distanceAnalysis: [],
        timeAnalysis: []
      };
    }

    // Filter delivered deliveries
    const deliveredDeliveries = alldeliveries.filter((delivery: Delivery) => delivery.delivery_status === 'delivered');

    // Total earnings
    const totalEarnings = deliveredDeliveries.reduce((total:number, delivery: Delivery) => 
      total + parseFloat(delivery.delivery_fee || '0'), 0
    );

    // Counts
    const deliveredCount = deliveredDeliveries.length;
    const pendingCount = alldeliveries.filter((delivery: Delivery) => delivery.delivery_status === 'pending').length;

    // Average delivery fee
    const avgDeliveryFee = deliveredCount > 0 ? totalEarnings / deliveredCount : 0;

    // Daily earnings analysis
    const dailyEarningsMap = new Map();
    deliveredDeliveries.forEach((delivery: Delivery) => {
      const date = new Date(delivery.delivered_at).toLocaleDateString();
      const fee = parseFloat(delivery.delivery_fee || '0');
      dailyEarningsMap.set(date, (dailyEarningsMap.get(date) || 0) + fee);
    });

    const dailyEarnings = Array.from(dailyEarningsMap.entries())
      .map(([date, earnings]) => ({ date, earnings: parseFloat(earnings.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Status distribution
    const statusCount = new Map();
    alldeliveries.forEach((delivery: Delivery) => {
      const status = delivery.delivery_status;
      statusCount.set(status, (statusCount.get(status) || 0) + 1);
    });

    const statusDistribution = Array.from(statusCount.entries()).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: ((count / alldeliveries.length) * 100).toFixed(1)
    }));

    // Performance metrics (earnings vs distance)
    const performanceMetrics = deliveredDeliveries.map((delivery: Delivery) => ({
      deliveryId: delivery.delivery_id,
      earnings: parseFloat(delivery.delivery_fee || '0'),
      distance: parseFloat(delivery.route_distance || '0') / 1000, // Convert to km
      duration: parseFloat(delivery.route_duration || '0') / 60, // Convert to minutes
      date: new Date(delivery.delivered_at).toLocaleDateString()
    }));

    // Distance analysis (grouped by distance ranges)
    const distanceRanges = [
      { range: '0-50km', min: 0, max: 50000 },
      { range: '50-100km', min: 50000, max: 100000 },
      { range: '100-150km', min: 100000, max: 150000 },
      { range: '150km+', min: 150000, max: Infinity }
    ];

    const distanceAnalysis = distanceRanges.map(range => {
      const deliveriesInRange = deliveredDeliveries.filter((delivery: Delivery) => {
        const distance = parseFloat(delivery.route_distance || '0');
        return distance >= range.min && distance < range.max;
      });

      const totalEarnings = deliveriesInRange.reduce((sum:any, delivery: Delivery) => 
        sum + parseFloat(delivery.delivery_fee || '0'), 0
      );
      
      return {
        range: range.range,
        count: deliveriesInRange.length,
        earnings: parseFloat(totalEarnings.toFixed(2)),
        avgEarnings: deliveriesInRange.length > 0 ? parseFloat((totalEarnings / deliveriesInRange.length).toFixed(2)) : 0
      };
    });

    // Time analysis (delivery time vs estimated time)
    const timeAnalysis = deliveredDeliveries
      .filter((delivery: Delivery) => delivery.delivered_at && delivery.estimated_delivery_time)
      .map((delivery: Delivery) => {
        const deliveredTime = new Date(delivery.delivered_at);
        const estimatedTime = new Date(delivery.estimated_delivery_time);
        const actualDuration = parseFloat(delivery.route_duration || '0') / 60; // minutes
        const timeDifference = (deliveredTime.getTime() - estimatedTime.getTime()) / (1000 * 60); // minutes
        
        return {
          deliveryId: delivery.delivery_id,
          actualDuration: parseFloat(actualDuration.toFixed(2)),
          timeDifference: parseFloat(timeDifference.toFixed(2)),
          earnings: parseFloat(delivery.delivery_fee || '0'),
          onTime: timeDifference <= 0
        };
      });

    return {
      totalEarnings,
      deliveredCount,
      pendingCount,
      avgDeliveryFee,
      dailyEarnings,
      statusDistribution,
      performanceMetrics,
      distanceAnalysis,
      timeAnalysis
    };
  }, [alldeliveries]);

  if (!alldeliveries) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading delivery data...</div>
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className=" flex justify-center items-center lg:text-3xl text-2xl font-bold text-gray-800 mb-8">Your Earnings Analytics</h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-teal-600">${analysisData.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-teal-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Deliveries</p>
                <p className="text-2xl font-bold text-blue-600">{analysisData.deliveredCount}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Deliveries</p>
                <p className="text-2xl font-bold text-orange-600">{analysisData.pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Per Delivery</p>
                <p className="text-2xl font-bold text-purple-600">${analysisData.avgDeliveryFee.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Earnings Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Daily Earnings Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analysisData.dailyEarnings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
                <Area type="monotone" dataKey="earnings" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Delivery Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Delivery Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analysisData.statusDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Earnings by Distance Range
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysisData.distanceAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'earnings' ? `$${value}` : value,
                    name === 'earnings' ? 'Total Earnings' : 'Delivery Count'
                  ]} 
                />
                <Legend />
                <Bar dataKey="earnings" fill="#10B981" name="earnings" />
                <Bar dataKey="count" fill="#3B82F6" name="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Distance vs Earnings Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analysisData.performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="distance" label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Earnings ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'earnings' ? `$${value}` : `${value}km`,
                    name === 'earnings' ? 'Earnings' : 'Distance'
                  ]}
                  labelFormatter={(label) => `Distance: ${label}km`}
                />
                <Line type="monotone" dataKey="earnings" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Time Performance Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Delivery Time Performance
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analysisData.timeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="deliveryId" label={{ value: 'Delivery ID', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} min`, 'Actual Duration']} />
                <Bar dataKey="actualDuration" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="flex flex-col justify-center">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">On-Time Performance</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700 font-medium">On Time Deliveries</span>
                  <span className="text-green-600 font-bold">
                    {analysisData.timeAnalysis.filter((d:any) => d.onTime).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-red-700 font-medium">Late Deliveries</span>
                  <span className="text-red-600 font-bold">
                    {analysisData.timeAnalysis.filter((d:any) => !d.onTime).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700 font-medium">Success Rate</span>
                  <span className="text-blue-600 font-bold">
                    {analysisData.timeAnalysis.length > 0 
                      ? ((analysisData.timeAnalysis.filter((d:any) => d.onTime).length / analysisData.timeAnalysis.length) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


