import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/customer/shopping-insights')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/customer/shopping-insights"!</div>
}
