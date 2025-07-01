export interface User {
  id: string
  email: string
  password: string // hashed
  role: 'customer' | 'store' | 'driver' | 'admin'
  profile: UserProfile
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  Customer = 'Customer',
  Store = 'Store',
  Driver = 'Driver',
  Admin = 'Admin',
}

export interface CreateUser {
  email: string
  password: string // hashed
  role: 'Customer' | 'Store' | 'Driver' | 'Admin'
  first_name: string
  last_name: string
  phone?: string // optional for some roles
  addresses?: Address[] // optional for some roles
}

export interface LoginType {
  email: string
  password: string
}

export interface LoginResponse {
  status: 'success' | 'error'
  message: string
  isAuthenticated: boolean
  user: {
    user_id: string
    first_name: string
    last_name: string
    email: string
    role: 'Customer' | 'Store' | 'Driver' | 'Admin'
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
  data: backendResponse
}

export interface backendResponse {
  isAuthenticated: boolean
  user: {
    user_id: string
    first_name: string
    last_name: string
    email: string
    role: 'Customer' | 'Store' | 'Driver' | 'Admin'
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface UserProfile {
  first_name: string
  last_name: string
  phone: string
  avatar?: string
  addresses: Address[]
  preferences: UserPreferences
}

export interface UserPreferences {
  language: string
  currency: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}
export interface Address {
  id: string
  userId: string // reference to User
  street: string
  city: string
  state: string
  country: string
  zipCode: string
  latitude?: number // for geolocation
  longitude?: number // for geolocation
  isDefault: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory?: string
  price: number
  unit: string // kg, pieces, liters
  images: string[]
  seller: Store
  inventory: {
    quantity: number
    threshold: number // low stock alert
    harvestDate?: Date
    expiryDate?: Date
  }
  ratings: {
    average: number
    count: number
    reviews: Review[]
  }
  tags: string[]
  isActive: boolean
  featured: boolean
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
    startDate: Date
    endDate: Date
  }
}

export interface Review {
  id: string
  productId: string // reference to Product
  userId: string // reference to User
  rating: number // 1 to 5
  comment: string
  createdAt: Date
}

export interface Store {
  id: string
  name: string
  description: string
  owner: User
  address: Address
  contact: {
    phone: string
    email: string
    website?: string
  }
  settings: {
    deliveryRadius: number
    minimumOrder: number
    deliveryFee: number
    processingTime: number // minutes
  }
  verification: {
    isVerified: boolean
    documents: string[]
    verifiedAt?: Date
  }
  isActive: boolean
}

export interface OrderItem {
  product: Product
  quantity: number
  price: number // price at time of order
  notes?: string // special instructions
}

export interface Order {
  id: string
  customer: User
  store: Store
  items: OrderItem[]
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready_pickup'
    | 'picked_up'
    | 'delivered'
    | 'cancelled'
  pricing: {
    subtotal: number
    deliveryFee: number
    tax: number
    discount: number
    total: number
  }
  delivery: {
    address: Address
    instructions?: string
    scheduledTime?: Date
    driver?: User
    estimatedTime: number
  }
  payment: {
    method: 'card' | 'mobile' | 'cash'
    status: 'pending' | 'paid' | 'failed' | 'refunded'
    transactionId?: string
  }
  timestamps: {
    createdAt: Date
    confirmedAt?: Date
    preparedAt?: Date
    pickedUpAt?: Date
    deliveredAt?: Date
  }
}

export interface Driver {
  id: string
  user: User
  vehicle: {
    type: 'bicycle' | 'motorcycle' | 'car' | 'van'
    licensePlate: string
    model: string
  }
  documents: {
    license: string
    insurance: string
    registration: string
  }
  verification: {
    isVerified: boolean
    backgroundCheck: boolean
    verifiedAt?: Date
  }
  status: 'online' | 'offline' | 'busy' | 'break'
  location: {
    latitude: number
    longitude: number
    lastUpdated: Date
  }
}

export interface Cart {
  id: string
  user: User
  items: CartItem[]
  updatedAt: Date
  expiresAt: Date
}

export interface CartItem {
  product: Product
  quantity: number
  price: number // price at time of adding
  notes?: string
}

export interface Wishlist {
  id: string
  user: User
  products: Product[]
  createdAt: Date
}

export interface Payment {
  id: string
  order: Order
  amount: number
  currency: string
  method: PaymentMethod
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  gateway: 'stripe' | 'mpesa' | 'paypal'
  transactionId: string
  metadata: Record<string, any>
  createdAt: Date
}
export interface PaymentMethod {
  type: 'card' | 'mobile' | 'bank_transfer'
  details: {
    cardNumber?: string // masked
    mobileNumber?: string
    bankAccount?: string
  }
}

export interface Notification {
  id: string
  recipient: User
  type: 'order_update' | 'promotion' | 'system' | 'reminder'
  title: string
  message: string
  data?: Record<string, any>
  channels: ('push' | 'email' | 'sms')[]
  isRead: boolean
  createdAt: Date
}
