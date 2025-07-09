import type {
  ApproveOrder,
  OrderResponse,
  CreateOrder,
  ShipOrder,
} from '../types/types'
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  approveOrder,
  shipOrder,
  getUserOrders,
} from '@/services/orderService'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query'

export const useOrders = (): UseQueryResult<OrderResponse[], Error> => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await getAllOrders()
      return response.json()
    },
  })
}

export const useOrder = (id: number) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  })
}

export const useCustomerOrders = (customerId: number) => {
  return useQuery({
    queryKey: ['customerOrders', customerId],
    queryFn: () => getUserOrders(customerId),
    enabled: !!customerId,
  })
}

type MutationType = 'create' | 'update' | 'delete'

interface UseOrderMutationOptions {
  type: MutationType
  id?: number
  onSuccess?: () => void
}

export function useOrderMutation({
  type,
  id,
  onSuccess,
}: UseOrderMutationOptions) {
  const queryClient = useQueryClient()

  const mutationFn = {
    create: createOrder,
    update: (data: CreateOrder) => {
      if (!id) throw new Error('ID is required for update')
      return updateOrder(id, data)
    },
    delete: () => {
      if (!id) throw new Error('ID is required for delete')
      return deleteOrder(id)
    },
  }[type]

  return useMutation({
    mutationKey: [
      type === 'update' || type === 'delete' ? `${type}Order` : 'createOrder',
      id,
    ],
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onSuccess?.()
    },
  })
}

export const useApproveOrderMutation = (order_id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['approveOrder', order_id],
    mutationFn: (approvedOrder: ApproveOrder) => {
      return approveOrder(order_id, approvedOrder)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
export const useShipOrderMutation = (order_id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['shipOrder', order_id],
    mutationFn: (shippingDetails: ShipOrder) => {
      return shipOrder(order_id, shippingDetails)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
