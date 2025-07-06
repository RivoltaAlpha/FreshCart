import type { CreateUser, User } from '../types/types'

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

export const getAllUsers = async () => {
  const token = getAuthToken()
  if (!token) {
    throw new Error('No token available in localStorage')
  }

  try {
    const response = await fetch(`${url}/users/all`, {
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

export const getUserById = async (id: number): Promise<User[]> => {
  const token = getAuthToken()
  const response = await fetch(`${url}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleApiResponse(response)
  return response.json()
}
export const createUser = async (user: User): Promise<CreateUser[]> => {
  const token = getAuthToken()
  const response = await fetch(`${url}/users/create`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  })
  await handleApiResponse(response)
  return response.json()
}

export const updateUser = async (
  user_id: number,
  { ...userData }: CreateUser,
): Promise<User[]> => {
  const token = getAuthToken()
  const response = await fetch(`${url}/users/${user_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  })
  await handleApiResponse(response)
  return response.json()
}
export const deleteUser = async (user_id: number): Promise<void> => {
  const token = getAuthToken()
  const response = await fetch(`${url}/users/delete/${user_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleApiResponse(response)
}
