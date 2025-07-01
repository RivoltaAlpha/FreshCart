import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

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

export const Route = createFileRoute('/driver')({
  component: DriverLayout,
})