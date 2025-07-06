import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/my-orders')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/customer/my-orders"!</div>
}
