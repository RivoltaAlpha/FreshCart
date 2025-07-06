import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/create-order')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/customer/create-order"!</div>
}
