import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { loggedInUser } from '@/store/auth';

function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const authUser = loggedInUser()
  const [currentPage, setCurrentPage] = useState('dashboard');
  const handleSidebarClose = () => setSidebarOpen(false);
  const handlePageChange = (id: string) => {
    if (id === 'openSidebar') {
      setSidebarOpen(true);
    } else {
      setCurrentPage(id);
    }
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar
        userType="customer"
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        sidebarToggle={true}
        onClose={handleSidebarClose}
      />
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <header className="bg-searchbar border-b shadow-2xl px-6 py-4 rounded-2xl mb-4 flex items-center justify-between">
          <div className="lg:flex-row flex flex-col items-center justify-between w-full">
            <div className="flex-col items-center text-text space-x-4">
              <h1 className="text-2xl font-bold ">Welcome back, {authUser?.profile.first_name}!</h1>
              <p className="mb-4">Discover fresh groceries and great deals</p>
            </div>
            <div className="flex items-center mx-8 space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

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

    if (!isAuthenticated && !isCustomer || isAuthenticated && !isCustomer) {
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