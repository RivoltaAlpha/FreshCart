import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  Eye,
  ArrowLeft,
  CreditCard,
  Filter,
  ShoppingCart
} from 'lucide-react'
import { useCreateOrderMutation, useCustomerOrders } from '@/hooks/useOrders'
import { authStore, loggedInUser } from '@/store/auth'
import { DeliveryMethod, type CustomerOrder, type Order } from '@/types/types'
import { useDeliveryByOrderId } from '@/hooks/useDeliveries'
import { toast } from 'sonner'
import { orderActions } from '@/store/order'

export const Route = createFileRoute('/customer/my-orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const user = loggedInUser()
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
  const { mutate: createNewOrder } = useCreateOrderMutation();
  const [loading, setLoading] = useState(false);
  const { data: orders, isLoading, error } = useCustomerOrders(user?.user_id ? parseInt(user.user_id) : 0)

  // Filter orders based on status
  const filteredOrders = orders?.filter((order: CustomerOrder) =>
    statusFilter === 'all' || order.status === statusFilter
  ) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'preparing':
        return <Package className="h-4 w-4" />
      case 'in_transit':
        return <Truck className="h-4 w-4" />
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
      case 'in_transit':
        return 'bg-purple-100 text-purple-800 border-purple-200'
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

  const handeleReorder = async () => {
    try {
      const orderData = {
        user_id: Number(selectedOrder?.user_id), // Use the parsed user_id, not authUser
        store_id: Number(selectedOrder?.store_id),
        delivery_method: selectedOrder?.delivery_method as DeliveryMethod,
        delivery_address: selectedOrder?.delivery_address,
        estimated_delivery_time: selectedOrder?.estimated_delivery_time,
        items: selectedOrder?.items.map(item => ({
          product_id: item.product.product_id,
          quantity: item.quantity
        }))
      };
      console.log('Order data prepared for API:', orderData);

      // Prepare order details for local store
      const orderDetails = {
        user_id: selectedOrder?.user_id, // Use parsed user_id
        store_id: selectedOrder?.store_id,
        customer_email: authStore.state.user.email,
        items: selectedOrder?.items ?? [],
        delivery_method: selectedOrder?.delivery_method as DeliveryMethod,
        delivery_address: selectedOrder?.delivery_address,
        total_amount: selectedOrder?.total_amount,
        delivery_fee: selectedOrder?.delivery_fee,
        estimated_delivery_time: selectedOrder?.delivery_method,
        subtotal: 0,
        promo_discount: 0,
      };

      orderActions.setCurrentOrder(orderDetails as any);
      setLoading(true);
      createNewOrder(orderData, {
        onSuccess: (createdOrder) => {
          console.log('Order created:', createdOrder);

          // Update local store with the created order ID if available
          if (createdOrder?.order_id) {
            orderActions.updateOrderDetails({
              order_id: createdOrder.order_id,
              order_number: createdOrder.order_number
            });
          }

          // Navigate to checkout
          navigate({ to: '/customer/checkout-order' });
          toast.success('Order created successfully! Proceeding to checkout...');
          setLoading(false);
        },
        onError: (error) => {
          console.error('Error creating order:', error);
          toast.error('Failed to create order. Please try again.');
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error in checkout process:', error);
      toast.error('Failed to proceed to checkout. Please try again.');
    }
  }

  // order time stamps:
  // confirmed_at picked_up_at, delivered_at, cancelled_at, finished_at

  const OrderDetailModal = ({ order, onClose }: { order: CustomerOrder, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-searchbar text-text rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-fresh-secondary">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-text transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Header */}
          <div className="bg-searchbar rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text">Order Number</p>
                <p className="font-semibold">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-text">Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-text">Total Amount</p>
                <p className="font-semibold text-[#00A7B3]">KSh {parseFloat(order.total_amount).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-text">Order Date</p>
                <p className="font-semibold">{formatDate(order.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Store Information
            </h3>
            <div className="space-y-1">
              <p className="font-medium">{order.store.name}</p>
              <p className="text-sm text-text">{order.store.contact_info}</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Information
            </h3>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">Method:</span> {order.delivery_method}</p>
              <p className="text-sm"><span className="font-medium">Address:</span> {order.delivery_address}</p>
            </div>
          </div>
          {/* Order Items */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium">{item.product?.name || `Product #${item.product_id}`}</p>
                    <p className="text-sm text-text">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KSh {parseFloat(item.total_price).toFixed(2)}</p>
                    <p className="text-sm text-text">@ KSh {parseFloat(item.unit_price).toFixed(2)} each</p>
                  </div>
                </div>
              )) || (
                  <p className="text-gray-500 text-center py-4">No items found</p>
                )}
            </div>
          </div>

          {(["delivered"].includes(order.status)) && (
            <div className='flex justify-center mt-4 bg-[#0d94b9] p-4 rounded-xl'>
              <button
                onClick={() => handeleReorder()}
                className="text-white hover:underline"
              >
                Reorder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
  const proceedToCheckout = async (order: Partial<Order>) => {
    const orderDetails: any = {
      user_id: order.user_id,
      store_id: order.store_id,
      customer_email: authStore.state.user.email,
      items: order.items,
      delivery_method: order.delivery_method,
      delivery_address: 'Default Address',
      subtotal: (((Number(order?.total_amount) || 0) - (Number(order?.delivery_fee) || 0) - (Number(order?.tax_amount) || 0)) + (Number(order?.tax_amount) || 0)).toFixed(2),
      delivery_fee: order.delivery_fee || 0,
      total_amount: order.total_amount || 0,
      estimated_delivery_time: order.estimated_delivery_time || 0,
    };

    navigate({ to: '/customer/checkout-order' });
    orderActions.setCurrentOrder(orderDetails);
    setLoading(true);
  };

  const [deliveryOrderId, setDeliveryOrderId] = useState<number | null>(null);
  const { data: deliveryInfo } = useDeliveryByOrderId(deliveryOrderId ?? 0);


  // Effect to set delivery info and navigate when deliveryOrderId changes
  useEffect(() => {
    if (deliveryOrderId && deliveryInfo) {
      localStorage.setItem('selectedDelivery', JSON.stringify(deliveryInfo));
      navigate({ to: '/customer/order-delivery' });
    }
  }, [deliveryOrderId, deliveryInfo, navigate]);

  const handleViewDetails = (order_id: number) => {
    setDeliveryOrderId(order_id);
    console.log('Fetching delivery info for order:', order_id);
  }
  // console.log(deliveryInfo);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-text mb-6">You need to be logged in to view your orders.</p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold text-fresh-primary mb-4">Processing your order...</h1>
          <ShoppingCart className="h-24 w-24 text-fresh-secondary animate-spin mb-6" />
          <p className="text-fresh-secondary">Please wait while we prepare your order.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h1>
          <p className="text-text mb-6">There was an error loading your orders. Please try again.</p>
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
      <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate({ to: '/customer/dashboard' })}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-text">My Orders</h1>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-text">Filter by status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00A7B3] focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3]"></div>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && (
          <>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {statusFilter === 'all' ? 'No Orders Yet' : `No ${statusFilter} Orders`}
                </h2>
                <p className="text-text mb-6">
                  {statusFilter === 'all'
                    ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                    : `You don't have any ${statusFilter.toLowerCase()} orders.`
                  }
                </p>
                {statusFilter === 'all' && (
                  <button
                    onClick={() => navigate({ to: '/products' })}
                    className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    Start Shopping
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order: CustomerOrder) => {
                  const statusSteps = [
                    'confirmed',
                    'preparing',
                    'ready_for_pickup',
                    'in_transit',
                    'delivered',
                  ];
                  const currentStep = statusSteps.indexOf(order.status)

                  return (
                    <div
                      key={order.order_id}
                      className="bg-searchbar border border-searchbar rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-fresh-primary text-lg">Order #{order.order_number}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[#00A7B3] hover:text-[#00A7B3]/80 flex items-center gap-1 text-sm font-medium transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-text">Store</p>
                              <p className="font-medium text-fresh-secondary">{order.store.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-text">Total</p>
                              <p className="font-medium text-fresh-secondary">KSh {parseFloat(order.total_amount).toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-text">Order Date</p>
                              <p className="font-medium text-fresh-secondary">{formatDate(order.created_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm text-text">Items</p>
                              <p className="font-medium text-fresh-secondary">{order.items?.length || 0} item(s)</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-sm text-text">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{order.delivery_address}</span>
                          </div>
                          <div>
                            {!["pending", "confirmed", "preparing", "ready_for_pickup"].includes(order.status) ? (
                              <button
                                onClick={() => handleViewDetails(order.order_id)}
                                className="bg-[#00A7B3] hover:bg-[#00A7B3]/80 text-white px-2 py-2 rounded-md font-medium transition-colors"
                              >
                                View Delivery details
                              </button>
                            ) : order.status === "pending" ? (
                              <button
                                onClick={() => proceedToCheckout(order as any)}
                                className="bg-[#00A7B3] hover:bg-[#00A7B3]/80 text-white px-2 py-2 rounded-md font-medium transition-colors"
                              >
                                Checkout Order
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {/* Order Progress Circles */}
                      <div className="flex items-center justify-center mt-2">
                        {statusSteps.map((step, idx) => {
                          const isCompleted = idx < currentStep;
                          const isCurrent = idx === currentStep;
                          // Colors: current = #41729F, completed = #274472, upcoming = #5885AF
                          const circleStyle = isCurrent
                            ? { backgroundColor: '#41729F', borderColor: '#41729F', color: 'white', boxShadow: '0 0 6px #41729F' }
                            : isCompleted
                              ? { backgroundColor: '#274472', borderColor: '#274472', color: 'white' }
                              : { backgroundColor: '#EAF0F6', borderColor: '#5885AF', color: '#5885AF' };
                          const labelStyle = isCurrent
                            ? { color: 'text', fontWeight: 600 }
                            : isCompleted
                              ? { color: 'text' }
                              : { color: 'text' };
                          // Connector color
                          const connectorColor = isCompleted ? '#274472' : isCurrent ? '#41729F' : '#5885AF';
                          return (
                            <div key={step} className="flex flex-col items-center">
                              <div className="flex items-center">
                                <div
                                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all"
                                  style={circleStyle}
                                  title={step.replace(/_/g, ' ')}
                                >
                                  {isCompleted ? '✓' : isCurrent ? idx + 1 : ''}
                                </div>
                                {/* Connector line (except after last circle) */}
                                {idx < statusSteps.length - 1 && (
                                  <div
                                    className="h-1 w-8 mx-1"
                                    style={{ backgroundColor: connectorColor, borderRadius: 2 }}
                                  />
                                )}
                              </div>
                              <span className="text-[10px] mt-1" style={labelStyle}>{step.replace(/_/g, ' ')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                }
                )}
              </div>
            )}
          </>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  )
}
