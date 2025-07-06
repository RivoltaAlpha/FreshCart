import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/store/manageProducts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/supllier/manageProducts"!</div>
}
