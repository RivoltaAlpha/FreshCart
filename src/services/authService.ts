const url = 'http://localhost:8000'
import { authStore } from '@/store/auth'
import type { CreateUser, LoginResponse } from '@/types/types'

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`

    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } else {
        const errorText = await response.text()
        if (errorText) {
          errorMessage = errorText
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError)
    }
    throw new Error(errorMessage)
  }
  return response
}

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${url}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    await handleApiResponse(response)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const logout = async (userId: number) => {
  const response = await fetch(`${url}/auth/signout/${userId}`)
  await handleApiResponse(response)
  return response.json()
}

export const refreshToken = async () => {
  const refreshToken = authStore.state.tokens.refreshToken
  const user_id = authStore.state.user.user_id
  if (!refreshToken || !user_id) {
    throw new Error('No refresh token or user ID available')
  }
  const response = await fetch(`${url}/auth/refresh/${user_id}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      'Content-Type': 'application/json',
    },
  })
  const data = await handleApiResponse(response)
  return data.json()
}

export const signUp = async (userData: CreateUser): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${url}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    await handleApiResponse(response)
    const data = await response.json()
    console.log('Sign up response:', data)
    return data
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}
