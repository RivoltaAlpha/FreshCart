import OrdersLineChart from '@/components/ordersChart';
import { useStoreOrders } from '@/hooks/useOrders';
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/store/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = localStorage.getItem("currentStore") || '';
  const storeId = store ? JSON.parse(store).store_id : 0;
  const ordersData = useStoreOrders(storeId);
  return (
    <>
      <div>
        <OrdersLineChart orders={ordersData.data} />
      </div>
    </>
  );
}
