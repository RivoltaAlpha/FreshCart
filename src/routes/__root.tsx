import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import TanStackQueryLayout from '../integrations/tanstack-query/layout.tsx'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from 'sonner'
import ChatbotIntegration from '@/components/ChatbotIntegration.tsx'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ThemeProvider defaultTheme="light" storageKey="freshcart-ui-theme">
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            duration: 3000,
          }}
        />
        <Outlet />
        <TanStackRouterDevtools />
        <TanStackQueryLayout />
        {/* Chatbot Integration Section */}
        <section className="py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ChatbotIntegration />
          </div>
        </section>
      </ThemeProvider>
    </>
  ),
})
