import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store/shipments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/Our/shipments"!</div>
}
