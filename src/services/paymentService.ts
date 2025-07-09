import type {
  CreatePayment,
  PaymentInitializeResponse,
  PaymentVerifyResponse,
} from '@/types/payments'

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

export const initializePayment = async (
  paymentData: CreatePayment,
): Promise<PaymentInitializeResponse> => {
  const token = getAuthToken()
  const response = await fetch(`${url}/payments/initialize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  })

  await handleApiResponse(response)
  return response.json()
}

export const verifyPayment = async (
  reference: string,
): Promise<PaymentVerifyResponse> => {
  const token = getAuthToken()
  const response = await fetch(`${url}/payments/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleApiResponse(response)
  return response.json()
}

export const getAllPayments = async () => {
  const token = getAuthToken()
  const response = await fetch(`${url}/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleApiResponse(response)
  return response.json()
}

export const getPaymentById = async (paymentId: number) => {
  const token = getAuthToken()
  const response = await fetch(`${url}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleApiResponse(response)
  return response.json()
}
