import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/customer/profile"!</div>
}
