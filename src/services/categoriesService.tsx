import type { Category, CreateCategory } from '../types/types';
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const getAllCategories = async () => {
  try {
    const response = await fetch(`${url}/categories/all`);
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return [];
  }
};

export const createCategory = async (category: CreateCategory) => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('No token available in localStorage');
  }

  try {
    const response = await fetch(`${url}/categories/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in createCategory:', error);
    throw error;
  }
};

export const getCategoryById = async (id: number): Promise<Category> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/categories/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateCategory = async (category_id: number, category: CreateCategory): Promise<Category> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/categories/${category_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });
  await handleApiResponse(response);
  return response.json();
};

export const deleteCategory = async (id: number): Promise<void> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};