import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useOrderMutation } from '@/hooks/useOrders';
import { useState, useEffect } from 'react';
import type { CreateOrder, DeliveryMethod, Product } from '@/types/types';
import { loggedInUser } from '@/store/auth';
import { useProducts } from '@/hooks/useProducts';

export const Route = createFileRoute('/customer/create-order')({
  component: RouteComponent,
});

function RouteComponent() {
  const [userId, setUserId] = useState(loggedInUser()?.user_id || '');
  const { data: products } = useProducts();
  const [storeId, setStoreId] = useState('1');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');

  const mutation = useOrderMutation({ type: 'create' });
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const order: CreateOrder = {
      store_id: Number(storeId),
      items: [{
        product_id: Number(productId),
        quantity: Number(quantity)
      }],
      delivery_address: deliveryAddress,
      delivery_phone: deliveryPhone,
      delivery_method: 'standard_delivery' as DeliveryMethod,
      estimated_delivery_time: 15,

    };
    mutation.mutate(order);
  }

  useEffect(() => {
    if (mutation.isSuccess) {
      const timeout = setTimeout(() => {
        navigate({ to: '/admin/success' });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [mutation.isSuccess, navigate]);

  return (
    <div className="max-w-xl mx-auto mt-16 bg-white p-8 rounded-lg shadow border border-[#005A61]/20">
      <h2 className="text-2xl font-bold text-[#005A61] mb-6">Create Order</h2>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm text-[#516E89]">
        {/* ...existing form fields... */}
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">User ID</label>
          <input
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
            placeholder="Enter User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Store ID</label>
          <input
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
            placeholder="Enter Store ID"
            value={storeId}
            onChange={e => setStoreId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Product</label>
          <select
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
            value={productId}
            onChange={e => setProductId(e.target.value)}
          >
            <option value="">Select a product</option>
            {Array.isArray(products?.products) && products.products.map((product: Product) => (
              <option key={product.product_id} value={product.product_id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Quantity</label>
          <input
            type="number"
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
            placeholder="Enter Quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Delivery Address</label>
          <input
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
            placeholder="Enter Delivery Address"
            value={deliveryAddress}
            onChange={e => setDeliveryAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-[#005A61]">Delivery Phone</label>
          <input
            className="w-full border border-[#6A89A7] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A7B3]"
            placeholder="Enter Delivery Phone"
            value={deliveryPhone}
            onChange={e => setDeliveryPhone(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-[#00A7B3] hover:bg-[#0097a2] text-white font-semibold px-6 py-2 rounded transition"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create Order'}
        </button>
        {mutation.isSuccess && (
          <div className="text-green-600 font-medium">✅ Order created successfully!</div>
        )}
        {mutation.isError && (
          <div className="text-red-600 font-medium">
            ❌ Error: {(mutation.error as Error).message}
          </div>
        )}
      </form>
    </div>
  );
}