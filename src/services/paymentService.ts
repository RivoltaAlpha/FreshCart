import type {
  CreatePayment,
  PaymentInitializeResponse,
  PaymentVerifyResponse,
} from '@/types/payments'
import { url } from '@/utils/utils'
import { getAuthToken, handleApiResponse } from './handleAPICalls'

export const initializePayment = async (
  paymentData: CreatePayment,
): Promise<PaymentInitializeResponse> => {
  const token = await getAuthToken()
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
  const token = await getAuthToken()
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
  const token = await getAuthToken()
  const response = await fetch(`${url}/payments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleApiResponse(response)
  return response.json()
}

export const getPaymentById = async (paymentId: number) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleApiResponse(response)
  return response.json()
}

// get user payments
export const getCustomerPayments = async (userId: number) => {
  const token = await getAuthToken()
  const response = await fetch(`${url}/payments/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleApiResponse(response)
  return response.json()
}