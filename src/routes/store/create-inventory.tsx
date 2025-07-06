import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store/create-inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/store/create-inventory"!</div>
}
