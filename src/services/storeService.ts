import type { Product } from '@/types/types';
import type {
  StoreProductsResponse,
  StoresResponse,
} from '../types/store'

const API_BASE_URL = 'http://localhost:8000'

const getAuthToken = (): string => {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const token = auth.tokens?.accessToken;
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

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
export const getStoreProducts = async (
  storeId: number,
): Promise<Product[]> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/store/${storeId}`, {
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

// Search products in a specific store
export const searchStoreProducts = async (
  storeId: number,
  query: string,
  categoryId?: number,
): Promise<StoreProductsResponse> => {
  const token = getAuthToken()
  const response = await fetch(
    `${API_BASE_URL}/stores/${storeId}/products/search`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, categoryId }),
    },
  )
  await handleApiResponse(response)
  return response.json()
}
