import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useApproveOrderMutation, useOrders, useShipOrderMutation } from '@/hooks/useOrders';

export const Route = createFileRoute('/store/ship-order')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: order, error } = useOrders();
  const [orderId, setOrderId] = useState('');
  const [shipping, setShipping] = useState('');
  const approveOrderMutation = useApproveOrderMutation(orderId ? Number(orderId) : 0);
  const shipOrderMutation = useShipOrderMutation(orderId ? Number(orderId) : 0);
  const navigate = useNavigate();

  const pendingOrders = order?.filter((o) => o.status === 'Pending') || [];

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    shipOrderMutation.mutate({
      order_id: Number(orderId),
      shipping: shipping as 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled',
    });
  };

  useEffect(() => {
    if (approveOrderMutation.isSuccess) {
      const timeout = setTimeout(() => {
        navigate({ to: '/warehouse/dashboard' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [approveOrderMutation.isSuccess, navigate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 min-h-screen bg-[#f4f8fa]">
      {/* Pending Orders */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-[#6A89A7]/30">
        <h2 className="text-2xl font-bold text-[#005A61] mb-6">📦 Pending Orders</h2>
        {pendingOrders.length > 0 ? (
          <ul className="divide-y divide-[#e5e7eb] text-sm text-[#516E89]">
            {pendingOrders.map((order) => (
              <li key={order.order_id} className="py-3">
                <div className="font-semibold text-[#005A61]">
                  #{order.order_id} - {order.user.first_name} {order.user.last_name}
                </div>
                <div className="text-xs">Status: {order.status}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#6A89A7]">No pending orders found.</p>
        )}
      </div>

      {/* Ship Order Form */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-[#6A89A7]/30">
        <h2 className="text-2xl font-bold text-[#005A61] mb-6">🚚 Ship Order</h2>
        <form onSubmit={handleSubmitShipping} className="space-y-6 text-sm">
          {/* Select Order */}
          <div>
            <label className="block mb-1 font-medium text-[#005A61]">Order</label>
            <select
              name="order_id"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full border border-[#6A89A7] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
              required
            >
              <option value="">Select Order</option>
              {order?.map((o) => (
                <option key={o.order_id} value={o.order_id}>
                  #{o.order_id}
                </option>
              ))}
              {error && <option disabled>Error loading orders</option>}
            </select>
          </div>

          {/* Shipping Status */}
          <div>
            <label className="block mb-1 font-medium text-[#005A61]">Shipping Status</label>
            <select
              name="shipping"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
              className="w-full border border-[#6A89A7] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
              required
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#00A7B3] hover:bg-[#0097a2] text-white font-semibold py-2 px-4 rounded transition"
            disabled={approveOrderMutation.isPending}
          >
            {approveOrderMutation.isPending ? 'Approving...' : 'Approve Order'}
          </button>

          {/* Feedback */}
          {approveOrderMutation.isSuccess && (
            <div className="text-green-600 font-medium mt-2">
              ✅ Order approved successfully!
            </div>
          )}
          {approveOrderMutation.isError && (
            <div className="text-red-600 font-medium mt-2">
              ❌ {(approveOrderMutation.error as Error).message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
