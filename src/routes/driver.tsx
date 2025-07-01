import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

function DriverLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex bg-[#f4f8fa] min-h-screen">
      <Sidebar
        userType="driver"
        currentPage="dashboard"
        onPageChange={() => {}}
        sidebarOpen={sidebarOpen}
        onClose={toggleSidebar}
      />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  );
}

const checkDriverAuth = () => {
  const authData = localStorage.getItem('auth')
  if (!authData) return { isAuthenticated: false, isDriver: false }
  try {
    const auth = JSON.parse(authData)
    const isAuthenticated = !!auth.isAuthenticated
    const isDriver = auth?.user?.role === 'Driver'
    return { isDriver, isAuthenticated }
  } catch {
    return { isDriver: false, isAuthenticated: false }
  }
}

export const Route = createFileRoute('/driver')({
    beforeLoad: async ({ location }) => {
      const { isAuthenticated, isDriver } = checkDriverAuth()
  
      if (!isAuthenticated && !isDriver) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }
    },
  component: DriverLayout,
})