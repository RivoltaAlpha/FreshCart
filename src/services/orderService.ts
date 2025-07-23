import type { StoreProduct } from '@/types/store'
import type {
  ApproveOrder,
  Order,
  CreateOrder,
  ShipOrder,
  CustomerOrder,
} from '@/types/types'
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const getAllOrders = async () => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/orders/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return handleApiResponse(response)
}

export const getOrderById = async (order_id: number): Promise<Order> => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/orders/${order_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return handleApiResponse(response).then((res) => res.json())
}

export const createOrder = async (orderData: CreateOrder) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  return handleApiResponse(response).then((res) => res.json())
}

export const updateOrder = async (order_id: number, orderData: CreateOrder) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/orders/update/${order_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  })
  return handleApiResponse(response).then((res) => res.json())
}

// update order status
export const updateOrderStatus = async (order_id: number, status: string) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/orders/update-status/${order_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id, status }),
  })
  return handleApiResponse(response).then((res) => res.json())
}

export const deleteOrder = async (order_id: number) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/orders/delete/${order_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return handleApiResponse(response)
}

export const approveOrder = async (
  order_id: number,
  approvedOrder: ApproveOrder,
): Promise<Order> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/orders/update/${order_id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: approvedOrder }),
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in approving Order:', error)
    throw error
  }
}
export const shipOrder = async (
  order_id: number,
  shippingDetails: ShipOrder,
): Promise<Order> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/orders/update/${order_id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: shippingDetails }),
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in shipping Order:', error)
    throw error
  }
}

// user orders
export const getUserOrders = async (
  userId: number,
): Promise<CustomerOrder[]> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/orders/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error fetching user orders:', error)
    throw error
  }
}

// get store orders
export const getStoreOrders = async (
  storeId: number,
): Promise<CustomerOrder[]> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/orders/store/${storeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error fetching store orders:', error)
    throw error
  }
}

export const getUserPurchases = async (
  userId: number,
): Promise<StoreProduct[]> => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/orders/user-purchases/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error fetching user purchases:', error)
    throw error
  }
}

export const getAllOrdersAnalytics = async () => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/orders/analytics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error fetching orders analytics:', error)
    throw error
  }
}