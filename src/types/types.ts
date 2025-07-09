import type { Payment } from './payments'

export interface User {
  user_id: string
  email: string
  password: string
  role: 'customer' | 'store' | 'driver' | 'admin'
  profile: {
    profile_id: string
    first_name: string
    last_name: string
    phone_number: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  phone?: string // optional for some roles
  addresses?: Address[] // optional for some roles
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

export interface UserPreferences {
  language: string
  currency: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

// backend Responses interface
// types/category.types.ts

export interface Category {
  category_id: number
  name: string
  description?: string
  image_url?: string
  created_at: Date
  updated_at: Date
  products?: Product[]
}

export interface CreateCategory {
  name: string
  description?: string
  image_url?: string
}

export interface UpdateCategory {
  name?: string
  description?: string
  image_url?: string
}

// types/inventory.types.ts

export enum InventoryAction {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  ADJUSTMENT = 'adjustment',
  RESERVED = 'reserved',
  RELEASED = 'released',
}

export interface Inventory {
  inventory_id: number
  store_id: number
  product_id: number
  stock_qty: number
  reserved_qty: number
  reorder_level: number
  cost_price: number
  last_restocked?: Date
  created_at: Date
  updated_at: Date
  store?: Store
  products?: Product[]
}

export interface CreateInventory {
  store_id: number
  product_id: number
  stock_qty: number
  reserved_qty?: number
  reorder_level?: number
  cost_price?: number
}

export interface UpdateInventory {
  stock_qty?: number
  reserved_qty?: number
  reorder_level?: number
  cost_price?: number
  last_restocked?: Date
}

// types/profile.types.ts

export interface Profile {
  profile_id: number
  user_id: number
  first_name?: string
  last_name?: string
  phone_number?: string
  date_of_birth?: Date
  gender?: string
  avatar_url?: string
  bio?: string
  created_at: Date
  updated_at: Date
  user?: User
  addresses?: Address[]
}

export interface CreateProfile {
  user_id: number
  first_name?: string
  last_name?: string
  phone_number?: string
  date_of_birth?: Date
  gender?: string
  avatar_url?: string
  bio?: string
}

export interface UpdateProfile {
  first_name?: string
  last_name?: string
  phone_number?: string
  date_of_birth?: Date
  gender?: string
  avatar_url?: string
  bio?: string
}

// types/address.types.ts

export interface Address {
  address_id: number
  profile_id: number
  street: string
  city: string
  state?: string
  postal_code?: string
  country: string
  isDefault: boolean
  created_at: Date
  updated_at: Date
  profile?: Profile
}

export interface CreateAddress {
  profile_id: number
  street: string
  city: string
  state?: string
  postal_code?: string
  country: string
  isDefault?: boolean
}

export interface UpdateAddress {
  street?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  isDefault?: boolean
}

// types/store.types.ts

export interface Store {
  store_id: number
  owner_id: number
  name: string
  description: string
  contact_info: string
  country?: string
  town?: string
  city?: string
  image_url?: string
  rating?: number
  total_reviews?: string
  store_code: string
  delivery_fee: number
  created_at: Date
  updated_at: Date
  owner?: User
  orders?: Order[]
  inventories?: Inventory[]
}

export interface CreateStore {
  store_id?: number
  owner_id: number
  name: string
  description: string
  contact_info: string
  country?: string
  town?: string
  city?: string
  image_url?: string
  rating?: number
  total_reviews?: string
  delivery_fee?: number
  store_code?: string
  created_at?: Date
  updated_at?: Date
}

export interface UpdateStore {
  name?: string
  description?: string
  contact_info?: string
  country?: string
  town?: string
  city?: string
  image_url?: string
  rating?: number
  total_reviews?: string
  delivery_fee?: number
}

// Backend product type
export interface BackendProduct {
  product_id: number
  category_id: number
  name: string
  description: string
  price: string
  stock_quantity: string
  image_url: string
  weight: string
  unit: string
  rating: string
  review_count: number
  discount: number
  expiry_date: string | null
  created_at: string
  updatedAt: string
  category: {
    category_id: number
    name: string
    description: string
    image_url: string
    created_at: string
  }
  inventory: any[]
}

// types/product.types.ts

export interface Product {
  product_id: number
  category_id: number
  name: string
  description: string
  price: string
  stock_quantity: string
  image_url: string
  weight: string
  unit: string
  rating: string
  review_count: number
  discount: number
  expiry_date: string | null
  created_at: string
  updatedAt: string
  category: {
    category_id: number
    name: string
    description: string
    image_url: string
    created_at: string
  }
  inventory?: Inventory[]
  products?: Product[]
}

export interface Products {
  products: Product[]
}

export interface CreateProduct {
  product_id?: number
  name: string
  store_id: number
  description: string
  price: number
  stock_quantity: number
  category_id: number
  image_url?: string
  weight?: number
  unit?: string
  rating?: number
  review_count?: number
  discount?: number
  initial_quantity?: number
  reorder_level?: number
  cost_price?: number
  created_at?: Date
  updated_at?: Date
}

export interface UpdateProduct {
  name?: string
  description?: string
  price?: number
  stock_quantity?: number
  category_id?: number
  image_url?: string
  weight?: number
  unit?: string
  rating?: number
  review_count?: number
  discount?: number
}

// types/order.types.ts

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum DeliveryMethod {
  PICKUP = 'pickup',
  STANDARD_DELIVERY = 'standard_delivery',
  EXPRESS_DELIVERY = 'express_delivery',
}

export interface Order {
  order_id: number
  order_number: string
  user_id: number
  store_id: number
  status: OrderStatus
  delivery_method: DeliveryMethod
  delivery_fee: number
  tax_amount: number
  total_amount: number
  delivery_address: string
  delivery_instructions?: string
  delivery_latitude?: number
  delivery_longitude?: number
  delivery_phone?: string
  estimated_delivery_time?: number
  actual_delivery_time?: Date
  driver_id?: number
  rating?: number
  created_at: Date
  updated_at: Date
  user?: User
  store?: Store
  products?: Product[]
  payments?: Payment[]
  driver?: User
  items?: OrderItem[]
}

export interface OrderItem {
  product_id: number
  quantity: number
}

export interface CreateOrder {
  store_id: number
  items: OrderItem[]
  delivery_address: string
  delivery_instructions?: string
  delivery_latitude?: number
  delivery_longitude?: number
  delivery_phone?: string
  delivery_method?: DeliveryMethod
  estimated_delivery_time?: number
}

export interface UpdateOrderStatus {
  status: OrderStatus
  driver_id?: number
  actual_delivery_time?: Date
}

export interface RateOrder {
  rating: number
  review?: string
}

// Response s
export interface OrderItemResponse {
  item_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  product_name?: string
}

export interface CustomerResponse {
  user_id: number
  username: string
  email: string
}

export interface StoreResponse {
  store_id: number
  name: string
  contact_info: string
}
//
export interface OrderResponse {
  order_id: number
  order_number: string
  status: OrderStatus
  total_amount: number
  delivery_method: DeliveryMethod
  delivery_address: string
  created_at: Date
  customer: CustomerResponse
  store: StoreResponse
  items: OrderItemResponse[]
  user: User
}

export interface ApproveOrder {
  order_id: number
  status: OrderStatus
}

export interface ShipOrder {
  order_id: number
  driver_id: number
  status: OrderStatus
  estimated_delivery_time?: Date
}

export interface CustomerOrder {
  order_id: number
  order_number: string
  user_id: number
  store_id: number
  delivery_fee: string
  discount_amount: string
  status: string
  delivery_method: string
  total_amount: string
  estimated_delivery_time: number
  created_at: string
  delivery_address: string
  tax_amount: string
  driver_id: number | null
  confirmed_at: string | null
  prepared_at: string | null
  picked_up_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  review: string | null
  rating: number | null
  store: {
    store_id: number
    owner_id: number
    name: string
    description: string
    city: string
    town: string
    country: string
    contact_info: string
    image_url: string
    rating: string
    total_reviews: number
    store_code: string
    delivery_fee: number
    created_at: string
    updated_at: string
  }
  payments: {
    payment_id: number
    payment_number: string
    order_id: number
    email: string
    authorization_url: string
    user_id: number
    amount: string
    currency: string
    payment_method: string
    gateway: string
    payment_reference: string
    status: string
    transaction_id: string
    gateway_reference: string | null
    gateway_response: {
      status: string
      gateway_response: string
      channel: string
      fees: number
      paid_at: string
      receipt_number: string
    }
    failure_reason: string | null
    refunded_amount: string
    processed_at: string
    failed_at: string | null
    updated_at: string
  }[]
  driver: any
  items: {
    item_id: number
    order_id: number
    product_id: number
    quantity: number
    unit_price: string
    total_price: string
    created_at: string
    product: {
      product_id: number
      category_id: number
      name: string
      description: string
      price: string
      stock_quantity: string
      image_url: string
      weight: string
      unit: string
      rating: string
      review_count: number
      discount: number
      expiry_date: string | null
      created_at: string
      updatedAt: string
    }
  }[]
}
