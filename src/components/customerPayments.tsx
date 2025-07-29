import React, { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { CreditCard, DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { PaymentStatus, type Payment } from '@/types/payments';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  color?: 'blue' | 'teal' | 'red' | 'yellow' | 'purple';
};

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon: Icon, change, changeType = 'positive', color = 'blue'
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    teal: 'bg-teal-500',
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
            <p className={`text-sm mt-1 ${changeType === 'positive' ? 'text-teal-600' : 'text-red-600'}`}>
              <span className={`inline-flex items-center ${changeType === 'positive' ? 'text-teal-600' : 'text-red-600'}`}>
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

// Add type for CustomerPayments props
type CustomerPaymentsProps = {
  payments?: Payment[];
};

const CustomerPayments: React.FC<CustomerPaymentsProps> = ({ payments = [] }) => {
  // Handle empty payments array
  if (!payments || payments.length === 0) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-g0ray-5 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payments</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Amount"
            value={stats.totalAmount}
            icon={DollarSign}
            change="+12.5%"
            color="teal"
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
            color="teal"
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
            color="teal"
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

        {/* Revenue Generation over time */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Shopping Trend Over Time</h3>
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
      </div>
    </div>
  );
};

export default CustomerPayments;