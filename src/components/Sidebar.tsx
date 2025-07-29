import { ChevronLeft, ChevronRight, HomeIcon, Menu, X } from 'lucide-react';
import { customerMenu, storeMenu, driverMenu, adminMenu } from '@/data/menus';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { logout } from '@/services/authService';
import { authActions, loggedInUser } from '@/store/auth';

const menus = {
  customer: customerMenu,
  store: storeMenu,
  driver: driverMenu,
  admin: adminMenu,
};

type UserType = 'customer' | 'store' | 'driver' | 'admin';

export function Sidebar({ userType, currentPage, onPageChange, sidebarOpen, sidebarToggle, onClose }: {
  userType: UserType;
  currentPage: string;
  onPageChange: (id: string) => void;
  sidebarOpen: boolean;
  sidebarToggle: boolean;
  onClose: () => void;
}) {

  const navigation = useNavigate();
  const location = useLocation();

  const onClickNavigation = (path: string) => {
    navigation({ to: path });
    onPageChange(path);
  }

  const user = loggedInUser();
  const user_id = user?.user_id;

  const handleLogout = () => {
    logout(user_id);
    authActions.deleteUser();
    navigation({ to: '/' });
  }

  // Enhanced function to check if a menu item is active
  const isActiveMenuItem = (item: any) => {
    // Check if currentPage matches the item ID
    if (currentPage === item.id) return true;

    // Check if currentPage matches the item path
    if (item.path && currentPage === item.path) return true;

    // Check if current location pathname matches the item path
    if (item.path && location.pathname === item.path) return true;

    // Check if current location pathname starts with the item path (for nested routes)
    if (item.path && location.pathname.startsWith(item.path)) return true;

    return false;
  };

  return (
    <>
      {/* Hamburger button for small screens, only visible when sidebar is closed */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 md:hidden p-2 text-gray-600 bg-white rounded-full shadow-lg hover:text-[#05445E] transition-all duration-200"
          onClick={() => onPageChange('openSidebar')}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar for small screens */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <aside className={`fixed inset-y-0 left-0 z-50 bg-[#189AB4] text-white shadow-lg transform ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-16'} transition-all duration-300 ease-in-out`}>
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className={`font-bold text-xl text-fresh-primary transition-opacity duration-200 ${!sidebarOpen && 'hidden'}`}>
              FreshCart
            </h1>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="text-white">
            {menus[userType]?.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveMenuItem(item);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onClickNavigation(item.path || item.id);
                  }}
                  className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 relative ${isActive
                    ? 'bg-[#189AB4]/20 text-white border-l-4 border-[#189AB4] shadow-lg'
                    : 'hover:bg-[#41729F]'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-[#189AB4]' : ''
                    } ${sidebarOpen ? 'mr-3' : ''}`} />
                  {sidebarOpen && (
                    <span className={`transition-all duration-200 ${isActive ? 'font-semibold' : ''
                      }`}>
                      {item.label}
                    </span>
                  )}

                  {/* Active indicator dot for collapsed sidebar */}
                  {!sidebarOpen && isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-[#189AB4] rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Status Toggle - only show when sidebar is open */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-600 mt-auto">
              <div className='px-2 flex items-center justify-between mb-4 hover:bg-[#41729F] rounded transition-colors duration-200'>
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className="w-full flex items-center py-2 text-left"
                >
                  <span>Logout</span>
                </button>
                <ChevronLeft size={20} className="mr-2" />
              </div>
              <div className="">
                <div className='px-4 flex items-center justify-between mb-4 align-top hover:bg-[#41729F] rounded transition-colors duration-200'>
                  <button
                    onClick={() => {
                      navigation({ to: '/' });
                    }}
                    className="w-full flex items-center py-2 text-left"
                  >
                    <span>Home</span>
                  </button>
                  <HomeIcon className="w-5 h-5 mr-3" />
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden md:block inset-y-0 left-0 z-50 bg-[#003B73] text-white shadow-lg transform ${sidebarToggle ? 'translate-x-0 w-64' : '-translate-x-full w-16'} transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className={`font-bold text-xl text-fresh-primary transition-opacity duration-200 ${!sidebarToggle && 'hidden'}`}>
            FreshCart
          </h1>
          <button
            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
          >
            {sidebarToggle ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="text-white">
          {menus[userType]?.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveMenuItem(item);

            return (
              <button
                key={item.id}
                onClick={() => {
                  onClickNavigation(item.path || item.id);
                }}
                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 relative ${isActive
                  ? 'bg-[#BFD7ED]/20 text-white border-l-4 border-[#BFD7ED] shadow-lg'
                  : 'hover:bg-[#0074B7]'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-[#189AB4]' : ''
                  } ${sidebarToggle ? 'mr-3' : ''}`} />
                {sidebarToggle && (
                  <span className={`transition-all duration-200 ${isActive ? 'font-semibold' : ''
                    }`}>
                    {item.label}
                  </span>
                )}

                {/* Active indicator dot for collapsed sidebar */}
                {!sidebarToggle && isActive && (
                  <div className="absolute right-2 w-2 h-2 bg-[#189AB4] rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status Toggle - only show when sidebar is open */}
        {sidebarToggle && (
          <div className="p-4 border-t border-gray-600 mt-auto">
            <div className='px-2 flex items-center justify-between mb-4 hover:bg-[#41729F] rounded transition-colors duration-200'>
              <button
                id='logout-button'
                onClick={() => {
                  handleLogout();
                }}
                className="w-full flex items-center py-2 text-left"
              >
                <span>Logout</span>
              </button>
              <ChevronLeft size={20} className="mr-2" />
            </div>
            <div className="">
              <div className='px-4 flex items-center justify-between mb-4 align-top hover:bg-[#41729F] rounded transition-colors duration-200'>
                <button
                  onClick={() => {
                    navigation({ to: '/' });
                  }}
                  className="w-full flex items-center py-2 text-left"
                >
                  <span>Home</span>
                </button>
                <HomeIcon className="w-5 h-5 mr-3" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}