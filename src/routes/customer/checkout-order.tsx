import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/checkout-order')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <div>My Orders</div>
    
  </div>
}
