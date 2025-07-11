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
  updated_at: string
  category: Category
}

export interface Store {
  store_id: number;
  owner_id: number;
  name: string;
  description: string;
  county: string;
  town: string;
  country: string;
  contact_info: string;
  image_url: string;
  rating: string;
  total_reviews: number;
  store_code: string;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
  owner: {
    user_id: number;
    email: string;
    profile: {
      first_name: string;
      last_name: string;
      phone_number: string;
    };
  };
  // Add computed properties for compatibility
  location?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}
export type StoreDetails = Partial<Store>;

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
  rating: string
  review_count: number
  discount: number
  expiry_date: string | null
  created_at: string
  updated_at: string
  category: Category
}

export interface InventoryProducts {
  inventory_id: number
  stock_qty: number
  products: ProductItem[]
}


export interface CartItem{
  product: {
    product_id: number,
    category_id: number,
    name: string,
    description: string,
    price: number,
    stock_quantity: number,
    image_url: string,
    weight: number,
    unit: string,
    rating: number,
    review_count: number,
    discount: number,
    expiry_date: null,
    category: {
      category_id: number,
      name: string,
      description: string,
      image_url: string,
      created_at: string
    }
  },
  quantity: 1
}