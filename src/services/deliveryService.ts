import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const getDeliveryByOrderId = async (orderId: number) => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/deliveries/order/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateDeliveryStatus = async (deliveryId: number, status: string) => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/deliveries/${deliveryId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDeliveriesForDriver = async (driverId: number) => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/deliveries/driver/${driverId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDeliveriesForCustomer = async (customerId: number) => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/deliveries/customer/${customerId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDeliveriesByStatus = async (status: string) => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/deliveries/status/${status}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};


// get all deliveries
export const getAllDeliveries = async () => {
  const token = await getAuthToken();
  const response = await fetch(`${url}/deliveries/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};
