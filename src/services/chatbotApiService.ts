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

export interface ApiProductResponse {
  products: ApiProduct[]
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
import { url } from '@/utils/utils'
import { handleApiResponse } from './handleAPICalls'
import type { StoresResponse } from '@/types/store'

class ChatbotApiService {
  private baseUrl: string

  constructor(baseUrl: string = url) {
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

  //fetch products ny category name
  async getProductsByCategoryName(categoryName: string): Promise<ApiProduct[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/categories/category-products?category_name=${encodeURIComponent(categoryName)}`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch products by category name')
      }
      const data = await response.json()
      console.log('Fetched products by category name:', data)
      // If the response is an array of categories, get products from the first one
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        Array.isArray(data[0].products)
      ) {
        return data[0].products
      }
      // If the response is an object with products array
      if (Array.isArray(data.products)) {
        return data.products
      }
      return []
    } catch (error) {
      console.error('Error fetching products by category name:', error)
      return []
    }
  }

  async getPopularProducts(): Promise<ApiProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/order-item/top-products`)
      if (!response.ok) {
        throw new Error('Failed to fetch popular products')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching popular products:', error)
      return []
    }
  }

  // Fetch all products
  async Products(): Promise<ApiProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/products/all`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      // If the response is an object with products array
      if (Array.isArray(data.products)) {
        return data.products
      }
      // If the response is already an array
      if (Array.isArray(data)) {
        return data
      }
      return []
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  extractProductKeyword(query: string): string {
    return query
      .replace(
        /do you have|can i get|please|find|show me|list|what is|how much|is there/gi,
        '',
      )
      .replace(/[?.,]/g, '')
      .trim()
  }

  // search a single product by name
  async searchProductByName(query: string): Promise<any | null> {
    try {
      const products = await this.Products()
      console.log(
        'Available products:',
        products.map((p: ApiProduct) => p.name),
      )
      if (products.length === 0) {
        return []
      }

      // Extract keyword from query
      const name = this.extractProductKeyword(query)
      const normalizedQuery = name.trim().toLowerCase()
      console.log('Normalized query:', normalizedQuery)

      let matches = products.filter(
        (p: ApiProduct) =>
          p.name && p.name.trim().toLowerCase() === normalizedQuery,
      )
      console.log(
        'Exact matches:',
        matches.map((p: ApiProduct) => p.name),
      )

      if (matches.length === 0) {
        matches = products.filter(
          (p: ApiProduct) =>
            p.name && p.name.toLowerCase().includes(normalizedQuery),
        )
        console.log(
          'Partial matches:',
          matches.map((p: ApiProduct) => p.name),
        )
      }

      if (matches.length === 0 && normalizedQuery.endsWith('s')) {
        const singular = normalizedQuery.slice(0, -1)
        matches = products.filter(
          (p: ApiProduct) => p.name && p.name.toLowerCase().includes(singular),
        )
        console.log(
          'Singular matches:',
          matches.map((p: ApiProduct) => p.name),
        )
      }

      const filteredMatches = matches.filter(
        (p: ApiProduct) => typeof p.name === 'string' && !!p.name && !!p.price,
      )
      console.log('Filtered matches:', filteredMatches)
      return filteredMatches
    } catch (error) {
      console.error('Error searching products by name:', error)
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

  // Fetch all stores
  async getAllStores(): Promise<StoresResponse> {
    const response = await fetch(`${url}/stores/all`)
    await handleApiResponse(response)
    return response.json()
  }
}

export default ChatbotApiService
