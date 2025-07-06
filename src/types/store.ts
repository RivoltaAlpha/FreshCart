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
  category: Category
}

export interface Store {
  store_id: number
  name: string
  description: string
  location: string
  phone: string
  email: string
  image_url: string
  rating: string
  is_active: boolean
  created_at: string
  updatedAt: string
}

export interface StoreProductsResponse {
  products: StoreProduct[]
  total: number
  page: number
  limit: number
}

export interface StoresResponse {
  stores: Store[]
  total: number
}

export interface InventoryProducts {
  inventory_id: number
  store_id: number
  product: StoreProduct | null
  product_id: number
  warehouse_id: number
  cost_price: string
  last_action: string
  stock_qty: number
  created_at: string
  updatedAt: string
}
