import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/drivers')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/drivers"!</div>
}
