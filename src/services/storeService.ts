import type { Product } from '@/types/types'
import type {
  allStoreProductsResponse,
  CreateStore,
  Store,
  StoreProductsResponse,
  StoresAnalytics,
  StoresResponse,
} from '../types/store'
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

// Fetch all stores
export const getAllStores = async (): Promise<StoresResponse> => {
  const response = await fetch(`${url}/stores/all`)
  await handleApiResponse(response)
  return response.json()
}

// Fetch products for a specific store
export const getStoreProducts = async (storeId: number): Promise<Product[]> => {
  try {
    const response = await fetch(`${url}/products/store/${storeId}`)
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
    const response = await fetch(`${url}/products/${product_id}/store`)
    await handleApiResponse(response)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error in getStoreProducts:', error)
    throw error
  }
}

export const getallStoreProducts = async (
  storeId: number,
): Promise<allStoreProductsResponse> => {
  
  try {
    const response = await fetch(`${url}/products/store/${storeId}`)
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
    `${url}/stores/${storeId}/products/search`,
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
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/stores/owner/${owner_id}`, {
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

// Create a new store
export const createStore = async (storeData: CreateStore): Promise<Store> => {
  try {
    const response = await fetch(`${url}/stores/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storeData),
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in createStore:', error)
    throw error
  }
}

// fetch unverified stores
export const getUnverifiedStores = async (): Promise<Store[]> => {
  const response = await fetch(`${url}/stores/unverified-stores`)
  await handleApiResponse(response)
  return response.json()
}

// Verify a store
export const verifyStore = async (storeId: number): Promise<Store> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/stores/verify/${storeId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in verifyStore:', error)
    throw error
  }
}

// all stores analytics
export const getAllStoresAnalytics = async (): Promise<StoresAnalytics> => {
  const response = await fetch(`${url}/stores/analytics`)
  await handleApiResponse(response)
  return response.json()
}