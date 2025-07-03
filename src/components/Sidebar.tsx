import { ChevronLeft, ChevronRight } from 'lucide-react';
import { customerMenu, storeMenu, driverMenu, adminMenu } from '@/data/menus';
import { ThemeToggle } from './ui/theme-toggle';

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
  // const [userStatus, setUserStatus] = useState<'online' | 'offline'>('online');

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-navbar text-accent-foreground shadow-lg transform ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-16'} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
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


      <nav className="mt-6">
        {menus[userType]?.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
              }}
              className={`w-full flex items-center px-6 py-8 text-left rounded-lg hover:bg-gray-50 ${currentPage === item.id ? 'bg-[#04b1bd] text-white hover:bg-[#7ec5d5]' : 'text-gray-700'}`}
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
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Theme</span>
            <ThemeToggle />
          </div>

          {/* Existing status toggle code */}
          {/* <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Status</span>
              <span className={`text-xs px-2 py-1 rounded-full ${userStatus === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}>
                {userStatus === 'online' ? 'Online' : 'Offline'}
              </span>
            </div> */}
        </div>
      )}
    </aside>
  );
}