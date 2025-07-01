import { Sidebar } from '@/components/Sidebar'
import { Outlet } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
component: () => (
    <div className="flex bg-[#f4f8fa] min-h-screen">
      <Sidebar
        userType="admin"
        currentPage="dashboard"
        onPageChange={() => {}}
        sidebarOpen={true}
        onClose={() => {}}
      />
      <div className="flex-1 p-4">
        <Outlet />
      </div>
    </div>
  ),
})

