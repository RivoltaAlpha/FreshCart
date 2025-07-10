import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/store"!</div>
}
