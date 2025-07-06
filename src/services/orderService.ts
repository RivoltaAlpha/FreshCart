import type { ApproveOrder, Order, OrderInput, ShipOrder } from "@/types/types";

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

export const getAllOrders = async () => {
      const token = getAuthToken();
  const response = await fetch(`${url}/orders/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
};

export const getOrderById = async (order_id: number): Promise<Order> => {
      const token = getAuthToken();
  const response = await fetch(`${url}/orders/${order_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response).then(res => res.json()); 
};

export const createOrder = async (orderData: OrderInput) => {
      const token = getAuthToken();
  const response = await fetch(`${url}/orders/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  return handleApiResponse(response).then(res => res.json());
};

export const updateOrder = async (order_id: number, orderData: OrderInput) => {
      const token = getAuthToken();
  const response = await fetch(`${url}/orders/update/${order_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  return handleApiResponse(response).then(res => res.json());
};

export const deleteOrder = async (order_id: number) => {
      const token = getAuthToken();
  const response = await fetch(`${url}/orders/delete/${order_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleApiResponse(response);
};

export const approveOrder = async (order_id: number, approvedOrder: ApproveOrder): Promise<Order> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No token available in localStorage');
  }

  try {
    const response = await fetch(`${url}/orders/update/${order_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: approvedOrder }),
    });
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in approving Order:', error);
    throw error;
  }
}
export const shipOrder = async (order_id: number, shippingDetails: ShipOrder): Promise<Order> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No token available in localStorage');
  }

  try {
    const response = await fetch(`${url}/orders/update/${order_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: shippingDetails }),
    });
    await handleApiResponse(response);
    return response.json();
  } catch (error) {
    console.error('Error in shipping Order:', error);
    throw error;
  }
}

