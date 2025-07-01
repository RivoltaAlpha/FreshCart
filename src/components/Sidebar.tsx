import { ChevronLeft, ChevronRight } from 'lucide-react';
import { customerMenu, storeMenu, driverMenu, adminMenu } from '@/data/menus';
import { useState } from 'react';

const menus = {
  customer: customerMenu,
  store: storeMenu,
  driver: driverMenu,
  admin: adminMenu,
};

type UserType = 'customer' | 'store' | 'driver' | 'admin';

export function Sidebar({ userType, currentPage, onPageChange, sidebarOpen, onClose }: {
  userType: UserType;
  currentPage: string;
  onPageChange: (id: string) => void;
  sidebarOpen: boolean;
  onClose: () => void;
}) {
  const [userStatus, setUserStatus] = useState<'online' | 'offline'>('online');
  
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-16'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className={`font-bold text-xl text-gray-800 ${!sidebarOpen && 'hidden'}`}>
          FreshCart
        </h1>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="mt-6">
        {menus[userType]?.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
              }}
              className={`w-full flex items-center px-6 py-3 text-left rounded-lg hover:bg-gray-50 ${currentPage === item.id ? 'bg-[#04b1bd] text-white hover:bg-[#7ec5d5]' : 'text-gray-700'}`}
            >
              <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      
      {/* Status Toggle - only show when sidebar is open */}
      {sidebarOpen && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <span className={`text-xs px-2 py-1 rounded-full ${userStatus === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {userStatus === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
          <button
            onClick={() => setUserStatus(userStatus === 'online' ? 'offline' : 'online')}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${userStatus === 'online'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            Go {userStatus === 'online' ? 'Offline' : 'Online'}
          </button>
        </div>
      )}
    </aside>
  );
}