import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getDeliveryByOrderId,
  updateDeliveryStatus,
  getDeliveriesForDriver,
  getDeliveriesForCustomer,
  getDeliveriesByStatus,
  getAllDeliveries,
} from '@/services/deliveryService'

export const useDeliveries = () =>
  useQuery({
    queryKey: ['deliveries'],
    queryFn: () => getAllDeliveries(),
  })

export const useDeliveryByOrderId = (orderId: number) =>
  useQuery({
    queryKey: ['delivery', 'order', orderId],
    queryFn: () => getDeliveryByOrderId(orderId),
    enabled: !!orderId,
  })

export const useUpdateDeliveryStatus = () =>
  useMutation({
    mutationFn: ({
      deliveryId,
      status,
    }: {
      deliveryId: number
      status: string
    }) => updateDeliveryStatus(deliveryId, status),
  })

export const useDeliveriesForDriver = (driverId: number) =>
  useQuery({
    queryKey: ['deliveries', 'driver', driverId],
    queryFn: () => getDeliveriesForDriver(driverId),
    enabled: !!driverId,
  })

export const useDeliveriesForCustomer = (customerId: number) =>
  useQuery({
    queryKey: ['deliveries', 'customer', customerId],
    queryFn: () => getDeliveriesForCustomer(customerId),
    enabled: !!customerId,
  })

export const useDeliveriesByStatus = (status: string) =>
  useQuery({
    queryKey: ['deliveries', 'status', status],
    queryFn: () => getDeliveriesByStatus(status),
    enabled: !!status,
  })
