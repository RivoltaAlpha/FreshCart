import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/create-store')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/create-store"!</div>
}
