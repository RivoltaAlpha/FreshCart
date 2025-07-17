import {
  Home,
  ShoppingCart,
  Package,
  Heart,
  User,
  Settings,
  Store,
  BarChart3,
  Users,
  Truck,
  Clock,
  DollarSign,
  Database,
  Bell,
  ShoppingBag,
  ClipboardCheck,
} from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  icon: any
  path?: string
}

export const customerMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/customer/dashboard',
  },
  {
    id: 'shop',
    label: 'Shop Products',
    icon: ShoppingBag,
    path: '/stores',
  },
  {
    id: 'cart',
    label: 'My Cart',
    icon: ShoppingCart,
    path: '/customer/cart',
  },
  {
    id: 'orders',
    label: 'My Orders',
    icon: Package,
    path: '/customer/my-orders',
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Heart,
    path: '/customer/wishlist',
  },
  {
    id: 'ai-recommendations',
    label: 'AI Recommendations',
    icon: Heart,
    path: '/customer/ai-recommendations',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/customer/profile',
  }
]

export const storeMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/store/dashboard',
  },
  {
    id: 'products',
    label: 'My Products',
    icon: Package,
    path: '/store/products',
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    path: '/store/manage-orders',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Database,
    path: '/store/inventories',
  },
  {
    id: 'stock-management',
    label: 'Stock Management',
    icon: ClipboardCheck,
    path: '/store/stock-management',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/store/analytics',
  },
  {
    id: 'store-settings',
    label: 'Store Settings',
    icon: Store,
    path: '/store/settings',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/store/profile',
  },
]

export const driverMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/driver/dashboard',
  },
  {
    id: 'deliveries',
    label: 'My Deliveries',
    icon: Truck,
    path: '/driver/deliveries',
  },
  // {
  //   id: 'route',
  //   label: 'Route Planning',
  //   icon: MapPin,
  //   path: '/driver/route-navigation',
  // },
  {
    id: 'history',
    label: 'Delivery History',
    icon: Clock,
    path: '/driver/delivery-history',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: DollarSign,
    path: '/driver/earnings',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/driver/notifications',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/driver/profile',
  },
  // {
  //   id: 'settings',
  //   label: 'Settings',
  //   icon: Settings,
  //   path: '/driver/settings',
  // },
]

export const adminMenu: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/admin/dashboard',
  },
  {
    id: 'users',
    label: 'System Users',
    icon: Users,
    path: '/admin/users',
  },
  {
    id: 'stores',
    label: 'Store Management',
    icon: Store,
    path: '/admin/stores',
  },
  {
    id: 'drivers',
    label: 'Driver Management',
    icon: Truck,
    path: '/admin/drivers',
  },
  {
    id: 'products',
    label: 'Product Management',
    icon: Package,
    path: '/admin/products',
  },
  {
    id: 'categories',
    label: 'Category Management',
    icon: Database,
    path: '/admin/categories',
  },
  {
    id: 'orders',
    label: 'Order Management',
    icon: ShoppingCart,
    path: '/admin/orders',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/admin/analytics',
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: DollarSign,
    path: '/admin/payments',
  },
  {
    id: 'settings',
    label: 'System Settings',
    icon: Settings,
    path: '/admin/settings',
  },
]
