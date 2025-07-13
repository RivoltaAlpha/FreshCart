import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver/profile"!</div>
}
