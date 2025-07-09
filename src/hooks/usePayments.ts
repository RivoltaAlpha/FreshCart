import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  initializePayment,
  verifyPayment,
  getAllPayments,
  getPaymentById,
} from '@/services/paymentService'
import type { CreatePayment } from '@/types/payments'

export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: getAllPayments,
  })
}

export const usePayment = (paymentId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: () => getPaymentById(paymentId),
    enabled: enabled && !!paymentId,
  })
}

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: (paymentData: CreatePayment) => initializePayment(paymentData),
    onError: (error) => {
      console.error('Payment initialization failed:', error)
    },
  })
}

export const useVerifyPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reference: string) => verifyPayment(reference),
    onSuccess: () => {
      // Invalidate payments queries after successful verification
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (error) => {
      console.error('Payment verification failed:', error)
    },
  })
}
