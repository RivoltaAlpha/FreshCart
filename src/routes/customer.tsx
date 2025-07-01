import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex bg-[#f4f8fa] min-h-screen">
      <Sidebar
        userType="customer"
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

const checkCustomerAuth = () => {
  const authData = localStorage.getItem('auth')
  if (!authData) return { isAuthenticated: false, isCustomer: false }
  try {
    const auth = JSON.parse(authData)
    const isAuthenticated = !!auth.isAuthenticated
    const isCustomer = auth?.user?.role === 'Customer'
    return { isCustomer, isAuthenticated }
  } catch {
    return { isCustomer: false, isAuthenticated: false }
  }
}

export const Route = createFileRoute('/customer')({
  beforeLoad: async ({ location }) => {
      const { isAuthenticated, isCustomer } = checkCustomerAuth()
  
      if (!isAuthenticated && !isCustomer) {
        throw redirect({
          to: '/login',
          search: {
            redirect: location.href,
          },
        })
      }
    },
  component: CustomerLayout,
})