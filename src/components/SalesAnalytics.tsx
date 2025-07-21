import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { CreditCard, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PaymentStatus, type Payment } from '@/types/payments';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
};

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon: Icon, change, changeType = 'positive', color = 'blue'
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              <span className={`inline-flex items-center ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-4 h-4 mr-1 ${changeType === 'negative' ? 'rotate-180' : ''}`} />
                {change}
              </span>
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Add type for PaymentsDashboard props
type PaymentsDashboardProps = {
  payments?: Payment[];
};

const PaymentsDashboard: React.FC<PaymentsDashboardProps> = ({ payments = [] }) => {
  // Handle empty payments array
  if (!payments || payments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Payments Found</h2>
          <p className="text-gray-500">There are no payments to display at the moment.</p>
        </div>
      </div>
    );
  }

  const stats = useMemo(() => {
    const totalAmount = payments.reduce((sum, payment) => {
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const completedPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED);
    const failedPayments = payments.filter(p => p.status === PaymentStatus.FAILED);
    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING);

    const totalFees = payments.reduce((sum, payment) => {
      return sum + (payment.gateway_response?.fees || 0);
    }, 0);

    const successRate = payments.length > 0 ? ((completedPayments.length / payments.length) * 100).toFixed(1) : 0;

    return {
      totalAmount: totalAmount.toLocaleString('en-KE', { style: 'currency', currency: 'KES' }),
      totalTransactions: payments.length,
      completedCount: completedPayments.length,
      failedCount: failedPayments.length,
      pendingCount: pendingPayments.length,
      successRate,
      totalFees: (totalFees / 100).toLocaleString('en-KE', { style: 'currency', currency: 'KES' })
    };
  }, [payments]);

  // Chart data preparation
  const statusData = useMemo(() => [
    { name: 'completed', value: Number(stats.completedCount), color: '#145DA0' },
    { name: 'failed', value: Number(stats.failedCount), color: '#EF4444' },
    { name: 'pending', value: Number(stats.pendingCount), color: '#2E8BC0' }
  ], [stats]);

  const paymentMethodData = useMemo(() => {
    const methodCounts: Record<string, number> = payments.reduce((acc, payment) => {
      const method = payment.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts).map(([method, count]) => ({
      name: method.replace('_', ' ').toUpperCase(),
      value: count
    }));
  }, [payments]);

  const dailyData = useMemo(() => {
    const daily: Record<string, { date: string; amount: number; count: number }> = payments.reduce((acc, payment) => {
      const date = new Date(payment.processed_at).toLocaleDateString('en-CA');
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      const amount = typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount;
      acc[date].amount += isNaN(amount) ? 0 : amount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    return Object.values(daily).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [payments]);

  const channelData = useMemo(() => {
    const channelCounts: Record<string, number> = payments.reduce((acc, payment) => {
      const channel = payment.gateway_response?.channel || 'unknown';
      acc[channel] = (acc[channel] || 0) + parseFloat(typeof payment.amount === 'string' ? payment.amount : payment.amount.toString());
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(channelCounts).map(([channel, amount]) => ({
      name: channel.replace('_', ' ').toUpperCase(),
      amount: amount
    }));
  }, [payments]);


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={stats.totalAmount}
            icon={DollarSign}
            change="+12.5%"
            color="green"
          />
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions}
            icon={CreditCard}
            change="+8.2%"
            color="blue"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            icon={CheckCircle}
            change="+2.1%"
            color="green"
          />
          <StatCard
            title="Total Fees"
            value={stats.totalFees}
            icon={TrendingUp}
            change="-1.5%"
            changeType="negative"
            color="purple"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="completed"
            value={stats.completedCount}
            icon={CheckCircle}
            color="green"
            change={`${((stats.completedCount / stats.totalTransactions) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="failed"
            value={stats.failedCount}
            icon={XCircle}
            color="red"
            change={`${((stats.failedCount / stats.totalTransactions) * 100).toFixed(1)}%`}
          />
          <StatCard
            title="pending"
            value={stats.pendingCount}
            icon={Clock}
            color="yellow"
            change={`${((stats.pendingCount / stats.totalTransactions) * 100).toFixed(1)}%`}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Payment Status Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Generation over time */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Generation Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'amount' ? `KES ${value.toLocaleString()}` : value,
                  name === 'amount' ? 'Amount' : 'Count'
                ]}
              />
              <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trends and Channel Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Payment Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'amount' ? `KES ${value.toLocaleString()}` : value,
                    name === 'amount' ? 'Amount' : 'Count'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Line type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Revenue */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="amount" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsDashboard;