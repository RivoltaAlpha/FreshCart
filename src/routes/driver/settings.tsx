import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver/settings"!</div>
}
