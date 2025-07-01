import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

function StoreLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex bg-[#f4f8fa] min-h-screen">
      <Sidebar
        userType="store"
        currentPage="dashboard"
        onPageChange={() => { }}
        sidebarOpen={sidebarOpen}
        onClose={toggleSidebar}
      />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}
const checkStoreAuth = () => {
  const authData = localStorage.getItem('auth')
  if (!authData) return { isAuthenticated: false, isStore: false }
  try {
    const auth = JSON.parse(authData)
    const isAuthenticated = !!auth.isAuthenticated
    const isStore = auth?.user?.role === 'Store'
    return { isStore, isAuthenticated }
  } catch {
    return { isStore: false, isAuthenticated: false }
  }
}

export const Route = createFileRoute('/store')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, isStore } = checkStoreAuth()

    if (!isAuthenticated && isStore) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: StoreLayout,
})

