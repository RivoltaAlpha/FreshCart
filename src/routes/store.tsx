import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Bell, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { loggedInUser } from '@/store/auth';

function StoreLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const authUser = loggedInUser();
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
    <div className="flex bg-[#f4f8fa] min-h-screen">
      <Sidebar
        userType="store"
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        sidebarToggle={true}
        onClose={handleSidebarClose}
      />
      <div className="flex-1 p-4 flex flex-col overflow-hidden">
        <header className="bg-navbar shadow-sm border-b px-6 py-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className=" px-6 py-4 ">
              <h1 className="text-2xl font-bold text-fresh-primary">Welcome back to your Store Management Platform {authUser?.profile.first_name}!</h1>
              <p className="text-fresh-secondary">Manage your store, products, and orders</p>
            </div>            <div className="flex items-center space-x-4">
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

    if (!isAuthenticated && !isStore || isAuthenticated && !isStore) {
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

