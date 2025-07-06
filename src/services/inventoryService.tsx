import type { Inventory, CreateInventory } from '../types/types';

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

export const getAllInventories = async () => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No token available in localStorage');
  }

  try {
    const response = await fetch(`${url}/inventories/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in getAllInventories:', error);
    throw error;
  }
};

export const createInventory = async (inventory: CreateInventory) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No token available in localStorage');
  }

  try {
    const response = await fetch(`${url}/inventories/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inventory),
    });
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in createInventory:', error);
    throw error;
  }
};

export const getInventoryById = async (id: number): Promise<Inventory[]> => {
  const token = getAuthToken();
  const response = await fetch(`${url}/inventories/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateInventory = async (inventory_id: number, inventory: CreateInventory): Promise<Inventory[]> => {
  const token = getAuthToken();
  const response = await fetch(`${url}/inventories/${inventory_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(inventory),
  });
  await handleApiResponse(response);
  return response.json();
};

export const deleteInventory = async (id: number): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${url}/inventories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

// // view inventory products
// export const getInventoryProducts = async (inventory_id: number): Promise<InventoryProduct[]> => {
//   const token = getAuthToken();
//   const response = await fetch(`${url}/inventories/products/${inventory_id}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
//   await handleApiResponse(response);
//   return response.json();
// };

// // update inventory stock
// export const updateInventoryStock = async (inventory_id: number, stockData: UpdateStock): Promise<Inventory> => {
//   const token = getAuthToken();
//   const response = await fetch(`${url}/inventories/update-stock/${inventory_id}`, {
//     method: 'PATCH',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify(stockData),
//   });
//   await handleApiResponse(response);
//   return response.json();
// };
