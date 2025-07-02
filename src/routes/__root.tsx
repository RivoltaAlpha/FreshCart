import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Header from '../components/Header.tsx'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import type { QueryClient } from '@tanstack/react-query'
import { Footer } from '@/components/Footer.tsx'
import { ThemeProvider } from '@/providers/theme-provider'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ThemeProvider defaultTheme="system" storageKey="freshcart-ui-theme">
        <Header />
        <Outlet />
        <TanStackRouterDevtools />
        <TanStackQueryLayout />
        <Footer />
      </ThemeProvider>
    </>
  ),
})
