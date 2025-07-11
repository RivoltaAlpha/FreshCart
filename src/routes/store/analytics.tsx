import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store/analytics')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/store/analytics"!</div>
}
