import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Bell, Search } from 'lucide-react';
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
        <header className="bg-searchbar border-b shadow-2xl px-6 py-4 rounded-2xl">
          <div className="lg:flex-row flex flex-col items-center justify-between">
            <div className="flex-col items-center text-text space-x-4">
              <h1 className="text-2xl font-bold ">Welcome back, {authUser?.profile.first_name}!</h1>
              <p className="mb-4">Discover fresh groceries and great deals</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Theme Toggle */}
              <ThemeToggle />
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  5
                </span>
              </button>
            </div>

          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
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