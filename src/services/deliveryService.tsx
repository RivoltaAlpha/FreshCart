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

export const getDeliveryByOrderId = async (orderId: number) => {
  const token = getAuthToken();
  const response = await fetch(`${url}/deliveries/order/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

export const updateDeliveryStatus = async (deliveryId: number, status: string) => {
  const token = getAuthToken();
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
  const token = getAuthToken();
  const response = await fetch(`${url}/deliveries/driver/${driverId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDeliveriesForCustomer = async (customerId: number) => {
  const token = getAuthToken();
  const response = await fetch(`${url}/deliveries/customer/${customerId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

export const getDeliveriesByStatus = async (status: string) => {
  const token = getAuthToken();
  const response = await fetch(`${url}/deliveries/status/${status}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await handleApiResponse(response);
  return response.json();
};

