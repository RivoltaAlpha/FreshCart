import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store/unverified')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/store/unverified"!</div>
}
