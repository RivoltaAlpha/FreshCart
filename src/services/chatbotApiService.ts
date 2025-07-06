// API service for chatbot product data
export interface Category {
  category_id: number
  name: string
  description: string
  image_url: string
  created_at: string
}

export interface ApiProduct {
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
  image_url: string
  rating: string
  created_at: string
}

class ChatbotApiService {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  // Fetch all products
  async getAllProducts(): Promise<ApiProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products/all`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Fetch products by category
  async getProductsByCategory(categoryId: number): Promise<ApiProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products?category_id=${categoryId}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch products by category')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return []
    }
  }

  // Search products by name or description
  async searchProducts(query: string): Promise<ApiProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`,
      )
      if (!response.ok) {
        throw new Error('Failed to search products')
      }
      return await response.json()
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  }

  // Fetch products by store
  async getProductsByStore(storeId: number): Promise<ApiProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products?store_id=${storeId}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch products by store')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching products by store:', error)
      return []
    }
  }

  // Fetch products by price range
  async getProductsByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<ApiProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products?min_price=${minPrice}&max_price=${maxPrice}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch products by price range')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching products by price range:', error)
      return []
    }
  }

  // Fetch all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/all`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Fetch all stores
  async getStores(): Promise<Store[]> {
    try {
      const response = await fetch(`${this.baseUrl}/stores/all`)
      if (!response.ok) {
        throw new Error('Failed to fetch stores')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching stores:', error)
      return []
    }
  }

  // Get product recommendations based on user history/preferences
  async getRecommendations(
    userId?: number,
    categoryId?: number,
  ): Promise<ApiProduct[]> {
    try {
      let url = `${this.baseUrl}/recommendations`
      const params = new URLSearchParams()

      if (userId) params.append('user_id', userId.toString())
      if (categoryId) params.append('category_id', categoryId.toString())

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      return []
    }
  }

  // Add product to cart
  async addToCart(
    productId: number,
    quantity: number = 1,
    userId?: number,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          user_id: userId,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Error adding to cart:', error)
      return false
    }
  }

  // Sample data for development/testing
  getSampleProducts(): ApiProduct[] {
    return [
      {
        product_id: 9,
        category_id: 1,
        name: 'Fresh Tomatoes',
        description: 'Juicy red tomatoes perfect for cooking and salads',
        price: '120.00',
        stock_quantity: '50',
        image_url:
          'https://images.unsplash.com/photo-1546470427-e8adf5d0e2b1?w=400',
        weight: '1.000',
        unit: 'per kg',
        rating: '4.80',
        review_count: 25,
        discount: 10,
        expiry_date: null,
        created_at: '2025-07-04T05:17:28.069Z',
        updatedAt: '2025-07-04T05:17:28.069Z',
        category: {
          category_id: 1,
          name: 'Fresh Produce',
          description: 'Fresh fruits and vegetables',
          image_url:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          created_at: '2025-07-04T01:33:59.520Z',
        },
      },
      {
        product_id: 10,
        category_id: 2,
        name: 'Fresh Milk',
        description: 'Pure cow milk, fresh from local farms',
        price: '80.00',
        stock_quantity: '30',
        image_url:
          'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        weight: '1.000',
        unit: 'per liter',
        rating: '4.60',
        review_count: 18,
        discount: 5,
        expiry_date: '2025-07-10T00:00:00.000Z',
        created_at: '2025-07-04T05:17:28.069Z',
        updatedAt: '2025-07-04T05:17:28.069Z',
        category: {
          category_id: 2,
          name: 'Dairy Products',
          description: 'Fresh dairy products',
          image_url:
            'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400',
          created_at: '2025-07-04T01:33:59.520Z',
        },
      },
      {
        product_id: 11,
        category_id: 1,
        name: 'Green Apples',
        description: 'Crisp and sweet green apples, perfect for snacking',
        price: '200.00',
        stock_quantity: '40',
        image_url:
          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        weight: '1.000',
        unit: 'per kg',
        rating: '4.70',
        review_count: 32,
        discount: 0,
        expiry_date: null,
        created_at: '2025-07-04T05:17:28.069Z',
        updatedAt: '2025-07-04T05:17:28.069Z',
        category: {
          category_id: 1,
          name: 'Fresh Produce',
          description: 'Fresh fruits and vegetables',
          image_url:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          created_at: '2025-07-04T01:33:59.520Z',
        },
      },
      {
        product_id: 12,
        category_id: 3,
        name: 'Whole Wheat Bread',
        description: 'Freshly baked whole wheat bread',
        price: '150.00',
        stock_quantity: '20',
        image_url:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        weight: '500.000',
        unit: 'per loaf',
        rating: '4.50',
        review_count: 15,
        discount: 15,
        expiry_date: '2025-07-08T00:00:00.000Z',
        created_at: '2025-07-04T05:17:28.069Z',
        updatedAt: '2025-07-04T05:17:28.069Z',
        category: {
          category_id: 3,
          name: 'Bakery',
          description: 'Fresh baked goods',
          image_url:
            'https://images.unsplash.com/photo-1555507036-ab794f0e7e10?w=400',
          created_at: '2025-07-04T01:33:59.520Z',
        },
      },
    ]
  }

  getSampleCategories(): Category[] {
    return [
      {
        category_id: 1,
        name: 'Fresh Produce',
        description: 'Fresh fruits and vegetables',
        image_url:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        created_at: '2025-07-04T01:33:59.520Z',
      },
      {
        category_id: 2,
        name: 'Dairy Products',
        description: 'Fresh dairy products',
        image_url:
          'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400',
        created_at: '2025-07-04T01:33:59.520Z',
      },
      {
        category_id: 3,
        name: 'Bakery',
        description: 'Fresh baked goods',
        image_url:
          'https://images.unsplash.com/photo-1555507036-ab794f0e7e10?w=400',
        created_at: '2025-07-04T01:33:59.520Z',
      },
    ]
  }
}

export default ChatbotApiService
