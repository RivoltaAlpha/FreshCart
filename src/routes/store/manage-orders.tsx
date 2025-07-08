import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react";
import { useOrders, useOrderMutation } from "@/hooks/useOrders";
import type { Order } from "@/types/types";

export const Route = createFileRoute('/store/manage-orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: orders, isLoading } = useOrders();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrderData, setNewOrderData] = useState<Partial<Order>>({});

  const createMutation = useOrderMutation({ type: "create" });
  const updateMutation = useOrderMutation({ type: "update", id: selectedOrder?.order_id });
  const deleteMutation = useOrderMutation({ type: "delete", id: selectedOrder?.order_id });

  if (isLoading) return <p>Loading orders...</p>;

  return (
    <div>
      <h1>Manage Orders</h1>

      {/* Create Order Section */}
      <section>
        <h2>Create Order</h2>
        <button onClick={() => createMutation.mutate(newOrderData as Order)}>
          Create
        </button>
      </section>

      {/* Orders List with Update/Delete */}
      <section>
        <h2>Existing Orders</h2>
        <ul>
          {!Array.isArray(orders) || orders.length === 0 ? (
            <li>No orders found.</li>
          ) : (
            orders.map((order: Order) => (
              <li key={order.order_id}>
                <span>{order.products?.map(product => product.name).join(", ")}</span>
                <button onClick={() => setSelectedOrder(order)}>Edit</button>
                <button onClick={() => deleteMutation.mutate(order)}>Delete</button>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* Update Order Section */}
      {selectedOrder && (
        <section>
          <h2>Update Order</h2>
          <input
            value={selectedOrder.products?.map(product => product.name).join(", ") || ""}
            onChange={(e) => {
              const names = e.target.value.split(", ");
              const updatedProducts = selectedOrder.products
                ? selectedOrder.products.map((product, idx) => ({
                  ...product,
                  name: names[idx] || product.name,
                }))
                : [];
              setSelectedOrder({ ...selectedOrder, products: updatedProducts });
            }}
          />
          <button
            onClick={() => updateMutation.mutate(selectedOrder)}
          >
            Update
          </button>
        </section>
      )}
    </div>
  );
}
