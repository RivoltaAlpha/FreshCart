import type { CreateProduct, Product } from '../types/types'
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${url}/products/all`)
    await handleApiResponse(response)
    const data = await response.json()
    return data.products 
  } catch (error) {
    console.error('Error in getAllProducts:', error)
    return []
  }
}

export const getProductById = async (
  product_id: number,
): Promise<Product[]> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/products/${product_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in getAllproducts:', error)
    throw error
  }
}

export const getStoreProducts = async (storeId: number): Promise<Product[]> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/products/store/${storeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in getAllproducts:', error)
    throw error
  }
}

export const createProduct = async (productData: CreateProduct) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/products/create`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  })
  await handleApiResponse(response)
  return response.json()
}

export const updateProduct = async (
  product_id: number,
  productData: CreateProduct,
) => {
  const token = await getAuthToken()
  const response = await fetch(`{url}/products/${product_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  })
  await handleApiResponse(response)
  return response.json()
}

export const deleteProduct = async (product_id: number) => {
  const token = await getAuthToken()
  const response = await fetch(`{url}/products/delete/${product_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleApiResponse(response)
}

  export const getPopularProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${url}/order-item/top-products`);
    if (!response.ok) {
      throw new Error('Failed to fetch popular products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }
}

// all products analytics
export const getAllProductsAnalytics = async (): Promise<any> => {
  const response = await fetch(`${url}/products/analytics`)
  await handleApiResponse(response)
  return response.json()
}