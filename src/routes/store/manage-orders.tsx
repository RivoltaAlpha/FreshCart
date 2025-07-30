import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react";
import { useStoreOrders, useUpdateOrderStatusMutation } from "@/hooks/useOrders";
import type { CustomerOrder, OrderStatus } from "@/types/types";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  CreditCard,
  Filter,
  Edit3
} from 'lucide-react'
import { useDeliveryByOrderId } from "@/hooks/useDeliveries";

export const Route = createFileRoute('/store/manage-orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = localStorage.getItem("currentStore") || '';
  const storeId = store ? JSON.parse(store).store_id : 0;
  const { data: orders, isLoading, isError } = useStoreOrders(storeId);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const updateMutation = useUpdateOrderStatusMutation(selectedOrder?.order_id ?? 0);

  // Filter orders based on status
  const filteredOrders = (() => {
    // Handle case where orders might be wrapped in an object or be an array directly
    let ordersArray: CustomerOrder[] = [];

    if (Array.isArray(orders)) {
      ordersArray = orders.map((order: any) => ({
        user_id: order.user_id ?? 0,
        store_id: order.store_id ?? 0,
        delivery_fee: order.delivery_fee ?? 0,
        discount_amount: order.discount_amount ?? 0,
        order_id: order.order_id ?? order.id ?? 0,
        order_number: order.order_number ?? "",
        status: order.status ?? "pending",
        total_amount: order.total_amount ?? 0,
        created_at: order.created_at ?? "",
        items: order.items ?? [],
        delivery_address: order.delivery_address ?? "",
        user: order.user ?? {},
        ...order
      }));
    } else if (orders && typeof orders === 'object' && 'orders' in orders) {
      ordersArray = ((orders as any).orders || []).map((order: any) => ({
        user_id: order.user_id ?? 0,
        store_id: order.store_id ?? 0,
        delivery_fee: order.delivery_fee ?? 0,
        discount_amount: order.discount_amount ?? 0,
        order_id: order.order_id ?? order.id ?? 0,
        order_number: order.order_number ?? "",
        status: order.status ?? "pending",
        total_amount: order.total_amount ?? 0,
        created_at: order.created_at ?? "",
        items: order.items ?? [],
        delivery_address: order.delivery_address ?? "",
        user: order.user ?? {},
        ...order
      }));
    } else if (orders && typeof orders === 'object' && 'data' in orders) {
      ordersArray = ((orders as any).data || []).map((order: any) => ({
        user_id: order.user_id ?? 0,
        store_id: order.store_id ?? 0,
        delivery_fee: order.delivery_fee ?? 0,
        discount_amount: order.discount_amount ?? 0,
        order_id: order.order_id ?? order.id ?? 0,
        order_number: order.order_number ?? "",
        status: order.status ?? "pending",
        total_amount: order.total_amount ?? 0,
        created_at: order.created_at ?? "",
        items: order.items ?? [],
        delivery_address: order.delivery_address ?? "",
        user: order.user ?? {},
        ...order
      }));
    }

    return ordersArray.filter((order: CustomerOrder) =>
      statusFilter === 'all' || order.status === statusFilter
    );
  })();

  const openModal = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status || "pending");
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setNewStatus("");
  };

  const handleStatusChange = () => {
    if (selectedOrder) {
      updateMutation.mutate(newStatus as OrderStatus);
      closeModal();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'preparing':
        return <Package className="h-4 w-4" />
      case 'ready_for_pickup':
        return <Truck className="h-4 w-4" />
      case 'in_transit':
        return <Package className="h-4 w-4" />
      case 'delivered':
        return <Package className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ready_for_pickup':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const [deliveryOrderId, setDeliveryOrderId] = useState<number | null>(null);
  const { data: deliveryInfo } = useDeliveryByOrderId(deliveryOrderId ?? 0);
  const navigate = useNavigate();
  useEffect(() => {
    if (deliveryOrderId && deliveryInfo) {
      localStorage.setItem('selectedDelivery', JSON.stringify(deliveryInfo));
      navigate({ to: '/store/track-order' });
    }
  }, [deliveryOrderId, deliveryInfo, navigate]);

  const handleViewDetails = (order_id: number) => {
    setDeliveryOrderId(order_id);
    console.log('Fetching delivery info for order:', order_id);
  }
  // console.log(deliveryInfo);

  // Status Change Modal Component
  const StatusChangeModal = ({ order, onClose }: { order: CustomerOrder, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Change Order Status</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold">{order.order_number || `#${order.order_id}`}</p>
            <p className="text-sm text-gray-600 mt-2">Current Status</p>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status || 'pending')}`}>
              {getStatusIcon(order.status || 'pending')}
              {order.status || 'pending'}
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              className="px-4 py-2 bg-[#00A7B3] text-white rounded-lg hover:bg-[#00A7B3]/90 transition-colors"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3]"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h1>
          <p className="text-gray-600 mb-6">There was an error loading the orders. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fresh-secondary mb-4">Manage Orders</h1>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-fresh-secondary">Filter by status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string | 'all')}
              className="border bg-card border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-24 w-24 text- mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === 'all' ? 'No Orders Yet' : `No ${statusFilter} Orders`}
            </h2>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "No orders have been placed yet."
                : `No ${statusFilter.toLowerCase()} orders found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: CustomerOrder) => (
              <div
                key={order.order_id}
                className="bg-searchbar border-b border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-lg">Order #{order.order_number || order.order_id}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status || 'pending')}`}>
                        {getStatusIcon(order.status || 'pending')}
                        {order.status || 'pending'}
                      </span>
                    </div>
                    {!["delivered"].includes(order.status) && (
                      <button
                        onClick={() => openModal(order)}
                        className="text-[#00A7B3] hover:text-[#00A7B3]/80 flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        Change Status
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Customer</p>
                        <p className="font-medium">
                          {(order as any).user?.profile?.first_name && (order as any).user?.profile?.last_name
                            ? `${(order as any).user.profile.first_name} ${(order as any).user.profile.last_name}`
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-medium text-[#00A7B3]">
                          KSh {order.total_amount ? parseFloat(order.total_amount.toString()).toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium">{order.created_at ? formatDate(order.created_at) : 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Items</p>
                        <p className="font-medium">{order.items?.length || 0} item(s)</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{order.delivery_address}</span>
                    </div>
                    <div>
                      {["in_transit", "delivered"].includes(order.status) && (
                        <button
                          onClick={() => handleViewDetails(order.order_id)}
                          className="bg-[#00A7B3] hover:bg-[#00A7B3]/80 text-white px-2 py-2 rounded-md font-medium transition-colors"
                        >
                          View Delivery details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Change Modal */}
        {selectedOrder && (
          <StatusChangeModal
            order={selectedOrder}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
}
