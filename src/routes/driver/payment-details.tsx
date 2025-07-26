import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/payment-details')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/store/payment-details"!</div>
}
