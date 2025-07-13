import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/route-navigation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver/route-navigation"!</div>
}
