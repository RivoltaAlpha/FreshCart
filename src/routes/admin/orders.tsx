import { useOrders } from '@/hooks/useOrders'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { ClipLoader } from 'react-spinners'
import type { OrderResponse } from '@/types/types'
import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Store, 
  Package, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown
} from 'lucide-react';

export const Route = createFileRoute('/admin/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isError, isLoading, error, isSuccess } = useOrders()
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    preparing: 'bg-orange-100 text-orange-800 border-orange-200',
    ready: 'bg-green-100 text-green-800 border-green-200',
    delivered: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    preparing: Package,
    ready: CheckCircle,
    delivered: CheckCircle,
    cancelled: XCircle
  };

  useEffect(() => {
    if (isSuccess && data) {
      setOrders(data);
      setFilteredOrders(data);
    }
  }, [isSuccess, data]);

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.user?.profile?.first_name || ''} ${order.user?.profile?.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.store?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, orders]);

  if (isError && error) {
    toast.error(`Error: ${error.message}`)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const OrderCard = ({ order }: { order: OrderResponse }) => {
    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Clock;
    const userName = `${order.user?.profile?.first_name || ''} ${order.user?.profile?.last_name || ''}`.trim() || 'N/A';
    const storeName = order.store?.name || 'N/A';
    const itemCount = Array.isArray(order.items) ? order.items.length : 0;
    const totalQuantity = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
      : 0;

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-[#005A61]/20 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <div className="bg-[#00A7B3]/10 p-2 rounded-full">
              <Package className="w-5 h-5 text-[#00A7B3]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#005A61]">
                {order.order_number}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusIcon className="w-4 h-4" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Customer and Store Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 border-b border-gray-200 pb-4">
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700">Customer</p>
              <p className="text-sm text-gray-600 truncate" title={userName}>{userName}</p>
              {order.user?.email && (
                <p className="text-xs text-gray-500 truncate">{order.user.email}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Store className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700">Store</p>
              <p className="text-sm text-gray-600 truncate" title={storeName}>{storeName}</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Items</p>
              <p className="text-sm font-medium">{itemCount} products ({totalQuantity} items)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-semibold text-green-600">
                KSh {order.total_amount?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Delivery Time</p>
              <p className="text-sm font-medium">{order.estimated_delivery_time || 'N/A'} min</p>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        {order.delivery_address && (
          <div className="flex items-start gap-2 mb-4 border-b border-gray-200 pb-4">
            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Delivery Address</p>
              <p className="text-sm text-gray-600 line-clamp-2" title={order.delivery_address}>
                {order.delivery_address}
              </p>
            </div>
          </div>
        )}

        {/* Financial Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 bg-gray-50 rounded-lg mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Delivery Fee</p>
            <p className="text-sm font-medium">KSh {order.delivery_fee || '0'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Tax</p>
            <p className="text-sm font-medium">KSh {order.tax_amount || '0'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Discount</p>
            <p className="text-sm font-medium">KSh {order.discount_amount || '0'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Method</p>
            <p className="text-sm font-medium capitalize">{order.delivery_method?.replace('_', ' ') || 'Standard'}</p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          {order.confirmed_at && (
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              <span>Confirmed: {new Date(order.confirmed_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {/* <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <>
              <button
                className="flex items-center justify-center gap-2 bg-[#145DA0] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                onClick={() => navigate({ to: `/admin/layout/approveOrder/${order.order_id}` })}
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              
              <button
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                onClick={() => navigate({ to: `/admin/layout/cancelOrder/${order.order_id}` })}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </>
          )}
        </div> */}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ClipLoader color="#00A7B3" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#005A61] mb-2">Orders Management</h2>
          <p className="text-gray-600">Manage and track all customer orders</p>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders, customers, stores..."
                className="w-full pl-10 pr-4 py-2 border border-[#00A7B3] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="pl-10 pr-8 py-2 border border-[#00A7B3] rounded-lg focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent appearance-none bg-white min-w-[140px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            
            {/* Items per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">Items per page:</span>
              <select
                className="border border-[#00A7B3] rounded px-2 py-1 text-[#005A61] text-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 30].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
        </div>

        {/* Orders Display */}
        {currentOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            {searchTerm && (
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search terms or filters
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => (
              <OrderCard key={order.order_id} order={order} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1 text-sm">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Math.max(1, Math.min(totalPages, Number(e.target.value) || 1));
                    setCurrentPage(page);
                  }}
                  className="border rounded px-2 py-1 w-16 text-center text-[#005A61]"
                />
              </div>
              
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                className="px-3 py-1 rounded bg-[#00A7B3] text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}