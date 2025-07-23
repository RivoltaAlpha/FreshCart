import type { CreateUser, User } from '../types/types'
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const getAllUsers = async () => {
  const token = await getAuthToken()
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
  const token = await getAuthToken()
  const response = await fetch(`${url}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleApiResponse(response)
  return response.json()
}
export const createUser = async (user: CreateUser): Promise<CreateUser[]> => {
  const response = await fetch(`${url}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
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
  const token = await getAuthToken()
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
  const token = await getAuthToken()
  const response = await fetch(`${url}/users/delete/${user_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleApiResponse(response)
}
