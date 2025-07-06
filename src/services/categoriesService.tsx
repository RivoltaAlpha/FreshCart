import type { Category, CreateCategory } from '../types/types';

const url = 'http://localhost:8000';

const getAuthToken = (): string => {
  const token = localStorage.getItem('token') || '';
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;

    try {
      // Try to parse as JSON first
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        // If not JSON, try to read as text
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      // If parsing fails, use the default error message
      console.warn('Failed to parse error response:', parseError);
    }

    throw new Error(errorMessage);
  }
  return response;
};

export const getAllCategories = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No token available in localStorage');
  }

  try {
    const response = await fetch(`${url}/categories/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    throw error;
  }
};

export const createCategory = async (category: CreateCategory) => {
  const token = getAuthToken();
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
  const token = getAuthToken();
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
  const token = getAuthToken();
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
  const token = getAuthToken();
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