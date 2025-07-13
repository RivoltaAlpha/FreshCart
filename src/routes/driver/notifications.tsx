import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/driver/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/driver/Notifications"!</div>
}
