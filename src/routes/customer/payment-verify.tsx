import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/payment-verify')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/customer/payment-verify"!</div>
}
