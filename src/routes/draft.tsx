import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/draft')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/draft"!</div>
}
