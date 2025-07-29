export interface Category {
  category_id: number
  name: string
  description: string
  image_url: string
  created_at: string
}

export interface StoreProduct {
  product_id: number
  category_id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url: string
  weight: string
  unit: string
  rating: number
  review_count: number
  discount: number
  expiry_date: string | null
  created_at: string
  updated_at: string
  category: Category
}

export interface Store {
  store_id: number
  owner_id: number
  name: string
  description: string
  county: string
  town: string
  country: string
  contact_info: string
  image_url: string
  rating: number
  is_verified: boolean
  total_reviews: number
  store_code: string
  delivery_fee: number
  account_number: string
  created_at: string
  updated_at: string
  owner: {
    user_id: number
    email: string
    profile: {
      first_name: string
      last_name: string
      phone_number: string
    }
  }
  address: {
    area: string
    town: string
    county: string
    country: string
  }
  // Add computed properties for compatibility
  location?: string
  phone?: string
  email?: string
  is_active?: boolean
}
export type StoreDetails = Partial<Store>
export type CreateStore = Partial<Store>

export interface StoreProductsResponse {
  products: StoreProduct[]
  total: number
  page: number
  limit: number
}

export interface StoresResponse {
  stores: Store[]
}

export interface ProductItem {
  product_id: number
  category_id: number
  name: string
  description: string
  price: string
  stock_quantity: string
  image_url: string
  weight: string
  unit: string
  rating: number
  review_count: number
  discount: number
  expiry_date: string | null
  created_at: string
  updated_at: string
  category?: Partial<Category>
}

export interface InventoryProducts {
  store_id: number
  inventory_id: number
  name: string
  stock_qty: number
  reorder_level: number
  max_stock_level: number
  cost_price: string | number
  last_restocked: string
  created_at?: string
  updated_at?: string
  products: Partial<ProductItem>[]
}

export interface CartItem {
  product: {
    product_id: number
    category_id: number
    name: string
    description: string
    price: number
    stock_quantity: number
    image_url: string
    weight: number
    unit: string
    rating: number
    review_count: number
    discount: number
    expiry_date: null
    category: {
      category_id: number
      name: string
      description: string
      image_url: string
      created_at: string
    }
  }
  quantity: 1
}

export interface ProductInStore {
  product_id: number
  category_id: number
  name: string
  description: string
  price: number
  stock_quantity: number
  image_url: string
  weight: number
  unit: string
  rating: number
  review_count: number
  discount: number
  expiry_date: string | null
  created_at: string
  updatedAt: string
}

export interface allStoreProductsResponse {
  products: ProductInStore[]
}

// Store revenue item
export interface StoreRevenue {
  store_store_id: number
  store_name: string
  totalRevenue: string | null
}

// Store order volume item
export interface StoreOrderVolume {
  store_store_id: number
  store_name: string
  month: string | null
  ordercount: string
}

// Top performing store
export interface TopPerformingStore {
  store_store_id: number
  store_name: string
  orderCount: string
}

// New stores trend item
export interface NewStoresTrend {
  month: string
  storecount: string
}

// Main analytics response
export interface StoresAnalytics {
  totalStores: number
  verifiedStores: number
  unverifiedStores: number
  storeRevenue: StoreRevenue[]
  topPerformingStore: TopPerformingStore
  newStoresTrend: NewStoresTrend[]
  storeOrderVolume: StoreOrderVolume[]
}

export interface ProductCategory {
  category_category_id: number
  category_name: string
  total_sales: string | null
}

export interface ProductRating {
  product_product_id: number
  product_name: string
  average_rating: string
  review_count: string
}

export interface TopProduct {
  product_id: number
  product_name: string
  totalquantity: string
}

export interface ProductAnalyticsData {
  topCategories: ProductCategory[]
  productRatings: ProductRating[]
  topProducts: TopProduct[]
}
