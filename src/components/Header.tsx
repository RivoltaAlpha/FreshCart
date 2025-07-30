import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './ui/theme-toggle';

interface HeaderProps {
  cartItems?: number;
}

export default function Header({ cartItems = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);

  // Store auth data in state instead of localStorage for artifact compatibility
  const [authData, setAuthData] = useState({ isAuthenticated: false, user: { role: 'Customer' } });

  // Simulate auth check (in real app, this would come from localStorage)
  useEffect(() => {
    // For demo purposes, you can toggle this to test different states
    setAuthData({ isAuthenticated: false, user: { role: 'Customer' } });
  }, []);

  const loggedIn = authData.isAuthenticated;
  const role = authData.user.role;

  const buttonStatus = {
    login: !loggedIn,
    logout: loggedIn
  }
  const navigate = useNavigate();
  const logout = () => {
    setAuthData({ isAuthenticated: false, user: { role: 'Customer' } });
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

  // Update indicator position when route changes
  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;

      const activeLink = navRef.current.querySelector('.active-nav-link');
      if (activeLink) {
        const navRect = navRef.current.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();

        setIndicatorStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width
        });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(updateIndicator, 10);
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
    <header className="bg-searchbar shadow-lg sticky top-0 z-50 border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <ShoppingCart className="h-8 w-8 " />
              <span className="ml-2 text-2xl font-bold text-fresh-secondary">FreshCart</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav ref={navRef} className="hidden md:flex space-x-8 relative">
            {/* Animated indicator */}
            <div
              className="absolute bottom-0 h-0.5 bg-[#189AB4] transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                transform: 'translateZ(0)' // Hardware acceleration
              }}
            />

            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative ${isActiveRoute(item.path)
                    ? 'text-[#189AB4] active-nav-link'
                    : ' hover:text-[#05445E] hover:scale-105'
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
                className="bg-[#189AB4] hover:bg-[#05445E] text-white px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={buttonStatus.logout ? logout : undefined}
              >
                {buttonStatus.login ? 'Login' : 'Logout'}
              </Link>
              <Link
                to="/register"
                className="border border-[#189AB4] hover:border-[#05445E] text-[#189AB4] hover:text-[#05445E] px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Register
              </Link>
              <Link
                to={dashboardRedirect(role)}
                className="border border-[#189AB4] hover:border-[#05445E] text-[#189AB4] hover:text-[#05445E] px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Dashboard
              </Link>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            <Link
              to="/customer/cart"
              className="relative p-2  hover:text-[#05445E] transition-all duration-200 hover:scale-110"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#189AB4] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2  hover:text-[#05445E] transition-all duration-200 hover:scale-110"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } overflow-hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
            {/* Mobile Navigation Links */}
            {navigation.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium w-full text-left transition-all duration-200 rounded-md transform ${isActiveRoute(item.path)
                    ? 'text-[#189AB4] bg-[#75E6DA]/10 translate-x-2'
                    : ' hover:text-[#05445E] hover:bg-gray-100 hover:translate-x-1'
                  }`}
                style={{
                  transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-[#189AB4] hover:bg-[#05445E] text-white px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                {buttonStatus.login ? 'Login' : 'Logout'}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center border border-[#189AB4] hover:border-[#05445E] text-[#189AB4] hover:text-[#05445E] px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}