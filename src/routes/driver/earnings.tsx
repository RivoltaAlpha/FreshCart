import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/earnings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver/earnings"!</div>
}
