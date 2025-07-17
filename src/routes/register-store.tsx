import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/register-store')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/register-store"!</div>
}
