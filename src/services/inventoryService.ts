import type { InventoryProducts } from '@/types/store';
import type { Inventory, CreateInventory } from '../types/types';
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const getAllInventories = async () => {
  const token = await getAuthToken();
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
  const token = await getAuthToken();
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
  const token = await getAuthToken();
  const response = await fetch(`${url}/inventories/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateInventory = async (inventory_id: number, inventory: CreateInventory): Promise<Inventory[]> => {
  const token = await getAuthToken();
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
  const token = await getAuthToken();
  const response = await fetch(`${url}/inventories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

// view inventory products
export const getInventoryProducts = async (inventory_id: number): Promise<InventoryProducts[]> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/inventories/products/${inventory_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

// Update stock interface
export interface UpdateStock {
  stock_qty: number;
}

// update inventory stock
export const updateInventoryStock = async (inventory_id: number, stockData: UpdateStock): Promise<Inventory> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/inventories/update-stock/${inventory_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(stockData),
  });
  await handleApiResponse(response);
  return response.json();
};

export const getStoreInventories = async (store_id: number): Promise<InventoryProducts[]> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/inventories/store/${store_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  await handleApiResponse(response);
  return response.json();
};

// Add product to inventory
export const addProductToInventory = async (inventory_id: number, product_id: number): Promise<any> => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/inventories/${inventory_id}/products/${product_id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  await handleApiResponse(response);
  return response.json();
};