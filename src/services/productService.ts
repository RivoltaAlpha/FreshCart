import type { CreateProduct, Product } from '../types/types'
const url = 'http://localhost:8000'

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

export const getAllProducts = async () => {
  let token
  try {
    token = getAuthToken()
  } catch (error) {
    // If no token, return empty array instead of throwing
    console.warn(
      'No authentication token found, returning empty products array',
    )
    return []
  }

  try {
    const response = await fetch(`${url}/products/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in getAllProducts:', error)
    return []
  }
}

export const getProductById = async (
  product_id: number,
): Promise<Product[]> => {
  const token = getAuthToken()
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
    console.error('Error in getAllUsers:', error)
    throw error
  }
}

export const getStoreProducts = async (storeId: number): Promise<Product[]> => {
  const token = getAuthToken()
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
    console.error('Error in getAllUsers:', error)
    throw error
  }
}

export const createProduct = async (productData: CreateProduct) => {
  const token = getAuthToken()
  const response = await fetch(`${url}/users/create`, {
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
  const token = getAuthToken()
  const response = await fetch(`{url}/users/${product_id}`, {
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
  const token = getAuthToken()
  const response = await fetch(`{url}/users/delete/${product_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleApiResponse(response)
}
