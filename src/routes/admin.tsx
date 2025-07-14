import { Sidebar } from '@/components/Sidebar'
import { Outlet, redirect } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
        userType="admin"
        currentPage={currentPage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        sidebarToggle={true}
        onClose={handleSidebarClose}
      />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  )
}
const checkAdminAuth = () => {
  const authData = localStorage.getItem('auth')
  if (!authData) return { isAuthenticated: false, isAdmin: false }
  try {
    const auth = JSON.parse(authData)
    const isAuthenticated = !!auth.isAuthenticated
    const isAdmin = auth?.user?.role === 'Admin'
    return { isAdmin, isAuthenticated }
  } catch {
    return { isAdmin: false, isAuthenticated: false }
  }
}


export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const { isAuthenticated, isAdmin } = checkAdminAuth()

    if (isAuthenticated && !isAdmin) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AdminLayout,
})

