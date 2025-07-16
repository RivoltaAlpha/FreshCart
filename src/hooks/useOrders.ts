import type {
  ApproveOrder,
  OrderResponse,
  CreateOrder,
  ShipOrder,
  CustomerOrder,
  OrderStatus,
  UpdateOrder,
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
  getStoreOrders,
  updateOrderStatus,
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
export const useStoreOrders = (store_id: number): UseQueryResult<CustomerOrder[], Error> => {
  return useQuery({
    queryKey: ['storeOrders'],
    queryFn: async () => {
      const response = await getStoreOrders(store_id)
      return response
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

// Create Order Mutation
export function useCreateOrderMutation(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['createOrder'],
    mutationFn: (data: CreateOrder) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'storeOrders'] })
      onSuccess?.()
    },
  })
}

// Update Order Mutation
export function useUpdateOrderMutation(id: number, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updateOrder', id],
    mutationFn: (data: UpdateOrder) => updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'storeOrders'] })
      onSuccess?.()
    },
  })
}

// Update Order Status Mutation
export function useUpdateOrderStatusMutation(id: number, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updatestatusOrder', id],
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'storeOrders'] })
      onSuccess?.()
    },
  })
}

// Delete Order Mutation
export function useDeleteOrderMutation(id: number, onSuccess?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['deleteOrder', id],
    mutationFn: () => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', 'storeOrders'] })
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
