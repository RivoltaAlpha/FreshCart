import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from './ui/theme-toggle';

interface HeaderProps {
  cartItems?: number;
}

export default function Header({ cartItems = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = localStorage.getItem('auth')
  const loggedIn = JSON.parse(user || '{}')?.isAuthenticated
  const role = JSON.parse(user || '{}')?.user?.role || 'Customer';

  const buttonStatus = {
    login: !loggedIn,
    logout: loggedIn
  }
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('auth');
    navigate({ to: '/login' });
  }

  const location = useLocation();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Recipes', path: '/recipes' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Stores', path: '/stores' }
  ];

  // Function to check if current route is active
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

const dashboardRedirect = (role: string) => {
  switch (role) {
    case 'Admin':
      return '/admin/dashboard';
    case 'Customer':
      return '/customer/dashboard';
    case 'Store':
      return '/store/dashboard';
    case 'Driver':
      return '/driver/dashboard';
    default:
      return '/login';
  }
};

  return (
    <header className="bg-navbar shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <ShoppingCart className="h-8 w-8 text-[#005A61]" />
              <span className="ml-2 text-2xl font-bold text-[#005A61]">FreshCart</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors relative ${isActiveRoute(item.path)
                  ? 'text-[#00A7B3] border-b-2 border-[#00A7B3]'
                  : 'text-[#516E89] hover:text-[#005A61]'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side - Auth + Cart + Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                className="bg-[#00A7B3] hover:bg-[#00939e] text-white px-4 py-2 rounded-full font-medium transition duration-300"
                onClick={buttonStatus.logout ? logout : undefined}
              >
                {buttonStatus.login ? 'Login' : 'Logout'}
              </Link>
              <Link
                to="/register"
                className="border border-[#00A7B3] hover:border-[#005A61] text-[#00A7B3] hover:text-[#005A61] px-4 py-2 rounded-full font-medium transition duration-300"
              >
                Register
              </Link>
              <Link
                to={dashboardRedirect(role)}
                className="border border-[#00A7B3] hover:border-[#005A61] text-[#00A7B3] hover:text-[#005A61] px-4 py-2 rounded-full font-medium transition duration-300"
              >
                Dashboard
              </Link>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-[#516E89] hover:text-[#005A61] transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#00A7B3] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-[#516E89] hover:text-[#005A61]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              {/* Mobile Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors rounded-md ${isActiveRoute(item.path)
                    ? 'text-[#00A7B3] bg-[#00A7B3]/10'
                    : 'text-[#516E89] hover:text-[#005A61] hover:bg-gray-100'
                    }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-[#00A7B3] hover:bg-[#00939e] text-white px-4 py-2 rounded-full font-medium transition duration-300"
                >
                  {buttonStatus.login ? 'Login' : 'Logout'}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center border border-[#00A7B3] hover:border-[#005A61] text-[#00A7B3] hover:text-[#005A61] px-4 py-2 rounded-full font-medium transition duration-300"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}