import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register-driver')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/register-driver"!</div>
}
