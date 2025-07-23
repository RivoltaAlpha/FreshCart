import type { CreateFeedback, Feedback, OrderFeedback } from "@/types/types"
import { url } from '@/utils/utils'

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

export const getAllFeedback = async () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/feedback/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in getAllFeedback:', error)
    throw error
  }
}

export const getFeedbackById = async (id: number) => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/feedback/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    await handleApiResponse(response)
    return response.json()
  } catch (error) {
    console.error('Error in getFeedbackById:', error)
    throw error
  }
}

// Create Feedback
export const createFeedback = async (feedback: CreateFeedback)
: Promise<Feedback> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }
  const response = await fetch(`${url}/feedback/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback),
  })
  await handleApiResponse(response)
  return response.json()
}

// order feedback
export const orderFeedback = async (order_id: number): Promise<OrderFeedback> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }
  const response = await fetch(`${url}/feedback/order/${order_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  await handleApiResponse(response)
  const feedback = await response.json()
  return feedback
}

// user feedbacks
export const userFeedbacks = async (userId: number): Promise<Feedback[]> => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }
  const response = await fetch(`${url}/feedback/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  await handleApiResponse(response)
  return response.json()
}