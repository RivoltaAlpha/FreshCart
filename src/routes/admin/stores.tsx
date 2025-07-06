import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/stores')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/stores"!</div>
}
