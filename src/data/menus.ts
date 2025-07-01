import {   Home,  ShoppingCart, Package, Heart, User, Settings,  Store,  BarChart3,  Users,  Truck,  MapPin,  Clock,  DollarSign,  Shield,  Database,  Bell} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path?: string;
}

export const customerMenu: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/'
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    path: '/products'
  },
  {
    id: 'cart',
    label: 'My Cart',
    icon: ShoppingCart,
    path: '/cart'
  },
  {
    id: 'orders',
    label: 'My Orders',
    icon: Clock,
    path: '/orders'
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Heart,
    path: '/wishlist'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  }
];

export const storeMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/store/dashboard'
  },
  {
    id: 'products',
    label: 'My Products',
    icon: Package,
    path: '/store/products'
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    path: '/store/orders'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/store/analytics'
  },
  {
    id: 'customers',
    label: 'Customers',
    icon: Users,
    path: '/store/customers'
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Database,
    path: '/store/inventory'
  },
  {
    id: 'store-settings',
    label: 'Store Settings',
    icon: Store,
    path: '/store/settings'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/store/profile'
  }
];

export const driverMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/driver/dashboard'
  },
  {
    id: 'deliveries',
    label: 'My Deliveries',
    icon: Truck,
    path: '/driver/deliveries'
  },
  {
    id: 'route',
    label: 'Route Planning',
    icon: MapPin,
    path: '/driver/route'
  },
  {
    id: 'history',
    label: 'Delivery History',
    icon: Clock,
    path: '/driver/history'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: DollarSign,
    path: '/driver/earnings'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/driver/notifications'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/driver/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/driver/settings'
  }
];

export const adminMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/admin/dashboard'
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    path: '/admin/users'
  },
  {
    id: 'stores',
    label: 'Store Management',
    icon: Store,
    path: '/admin/stores'
  },
  {
    id: 'drivers',
    label: 'Driver Management',
    icon: Truck,
    path: '/admin/drivers'
  },
  {
    id: 'products',
    label: 'Product Management',
    icon: Package,
    path: '/admin/products'
  },
  {
    id: 'orders',
    label: 'Order Management',
    icon: ShoppingCart,
    path: '/admin/orders'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics'
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    path: '/admin/security'
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    path: '/admin/settings'
  }
];