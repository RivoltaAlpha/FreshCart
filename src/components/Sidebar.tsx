import { ChevronLeft, ChevronRight } from 'lucide-react';
import { customerMenu, storeMenu, driverMenu, adminMenu } from '@/data/menus';
import { useNavigate } from '@tanstack/react-router';
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

  const navigation = useNavigate();
  const onClickNavigation = (path: string) => {
    navigation({ to: path });
    onPageChange(path);
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-[#013A66] text-white shadow-lg transform ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-16'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className={`font-bold text-xl text-fresh-primary ${!sidebarOpen && 'hidden'}`}>
          FreshCart
        </h1>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>


      <nav className="text-white">
        {menus[userType]?.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onClickNavigation(item.path || item.id);
              }}
              className={`w-full flex items-center px-6 py-4 text-left hover:bg-[#41729F] ${currentPage === item.id ? ' text-white hover:bg-[#6464DC]' : ''}`}
            >
              <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Status Toggle - only show when sidebar is open */}
      {sidebarOpen && (
        <div className="p-4 border-t border-border">
          <div className='flex items-center justify-between mb-4'>
            <button
              onClick={() => {
                localStorage.removeItem('auth');
                navigation({ to: '/login' });
              }}
              className="w-full flex items-center py-2 text-left rounded-lg hover:bg-[#41729F] "
            >
              <span className=""> Logout</span>
            </button>
                <ChevronLeft size={20} className="mr-2" />
          </div>
        </div>
      )}
    </aside>
  );
}