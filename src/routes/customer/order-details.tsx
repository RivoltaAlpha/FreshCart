import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/order-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/customer/order-details"!</div>
}
