import type { Product } from '@/types/types'
import type {
  allStoreProductsResponse,
  Store,
  StoreProductsResponse,
  StoresResponse,
} from '../types/store'

const API_BASE_URL = 'http://localhost:8000'

const getAuthToken = (): string => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}')
  const token = auth.tokens?.accessToken
  if (!token) {
    throw new Error('No authentication token found')
  }
  return token
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`

    try {
      // Try to parse as JSON first
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        // If not JSON, try to read as text
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
      }
    } catch (parseError) {
      // If parsing fails, use the default error message
      console.warn('Failed to parse error response:', parseError)
    }

    throw new Error(errorMessage)
  }
  return response
}

// Fetch all stores
export const getAllStores = async (): Promise<StoresResponse> => {
  const response = await fetch(`${API_BASE_URL}/stores/all`)
  await handleApiResponse(response)
  return response.json()
}

// Fetch products for a specific store
export const getStoreProducts = async (storeId: number): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/store/${storeId}`)
    await handleApiResponse(response)
    const data = await response.json()

    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data
    } else if (data && data.products && Array.isArray(data.products)) {
      return data.products
    } else {
      console.warn('API returned non-array data for store products:', data)
      return []
    }
  } catch (error) {
    console.error('Error in getStoreProducts:', error)
    throw error
  }
}

// Fetch products for a specific store
export const getStoreHavingProduct = async (product_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${product_id}/store`)
    await handleApiResponse(response)
    const data = await response.json()

    // Ensure we always return an array
    if (Array.isArray(data)) {
      return data
    } else if (data && data.products && Array.isArray(data.products)) {
      return data.products
    } else {
      console.warn('API returned non-array data for store products:', data)
      return []
    }
  } catch (error) {
    console.error('Error in getStoreProducts:', error)
    throw error
  }
}

export const getallStoreProducts = async (
  storeId: number,
): Promise<allStoreProductsResponse> => {
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/store/${storeId}`)
    await handleApiResponse(response)
    const data = await response.json()

    // Normalize the response to match the expected type
    return { products: data }
  } catch (error) {
    console.error('Error in getallStoreProducts:', error)
    throw error
  }
}

// Search products in a specific store
export const searchStoreProducts = async (
  storeId: number,
  query: string,
  categoryId?: number,
): Promise<StoreProductsResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/stores/${storeId}/products/search`,
    {
      method: 'POST',
      body: JSON.stringify({ query, categoryId }),
    },
  )
  await handleApiResponse(response)
  return response.json()
}

// Fetch products for a specific store
export const getStoreByOwnerId = async (owner_id: number): Promise<Store> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/stores/owner/${owner_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    throw error
  }
}
