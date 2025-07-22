import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  orderFeedback,
  userFeedbacks,
} from '@/services/feedbackService'
import type { Feedback } from '@/types/types'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

export const useFeedback = (): UseQueryResult<Feedback[], Error> => {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: getAllFeedback,
  })
}

export const useFeedbackById = (
  id: number,
): UseQueryResult<Feedback, Error> => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => getFeedbackById(id),
    enabled: !!id,
  })
}

export const useCreateFeedback = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['createFeedback'],
    mutationFn: createFeedback,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      localStorage.removeItem('selectedDelivery')
      navigate({ to: '/customer/success' })
    },
  })
}

// user feedbacks
export const useUserFeedbacks = (userId: number) => {
  return useQuery({
    queryKey: ['userFeedbacks', userId],
    queryFn: () => userFeedbacks(userId),
    enabled: !!userId,
  })
}

export const useOrderFeedback = (order_id: number) => {
  return useQuery({
    queryKey: ['orderFeedback', order_id],
    queryFn: () => orderFeedback(order_id),
    enabled: !!order_id,
  })
}