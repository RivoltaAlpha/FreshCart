import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/deliveries')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver/deliveries"!</div>
}
