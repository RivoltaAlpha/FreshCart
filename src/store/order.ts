import { Store } from '@tanstack/store'
import type { CartItem } from './cart'
import type { DeliveryMethod } from '@/types/types'

export interface OrderDetails {
  order_id?: number
  order_number?: string
  user_id?: string | number
  store_id?: number
  customer_email?: string
  items: CartItem[]
  delivery_method: DeliveryMethod | string
  delivery_address?: string
  delivery_instructions?: string
  delivery_phone?: string
  subtotal: number
  delivery_fee: number
  tax_amount?: number
  promo_code?: string
  promo_discount: number
  total_amount: number
  estimated_delivery_time?: number
}

interface OrderState {
  currentOrder: OrderDetails | null
  orderHistory: OrderDetails[]
}

const initialOrderState: OrderState = {
  currentOrder: null,
  orderHistory: [],
}

export const orderStore = new Store<OrderState>(initialOrderState)

export const orderActions = {
  setCurrentOrder: (orderDetails: OrderDetails) => {
    orderStore.setState({
      ...orderStore.state,
      currentOrder: orderDetails,
    })
    // Save to localStorage for persistence
    localStorage.setItem('currentOrder', JSON.stringify(orderDetails))
  },

  getCurrentOrder: (): OrderDetails | null => {
    return orderStore.state.currentOrder
  },

  updateOrderDetails: (updates: Partial<OrderDetails>) => {
    const currentOrder = orderStore.state.currentOrder
    if (currentOrder) {
      const updatedOrder = { ...currentOrder, ...updates }
      orderStore.setState({
        ...orderStore.state,
        currentOrder: updatedOrder,
      })
      localStorage.setItem('currentOrder', JSON.stringify(updatedOrder))
    }
  },

  addToOrderHistory: (order: OrderDetails) => {
    const currentHistory = orderStore.state.orderHistory
    orderStore.setState({
      ...orderStore.state,
      orderHistory: [order, ...currentHistory],
    })
    // Save to localStorage
    localStorage.setItem(
      'orderHistory',
      JSON.stringify([order, ...currentHistory]),
    )
  },

  clearCurrentOrder: () => {
    orderStore.setState({
      ...orderStore.state,
      currentOrder: null,
    })
    localStorage.removeItem('currentOrder')
  },

  loadFromStorage: () => {
    try {
      const savedOrder = localStorage.getItem('currentOrder')
      const savedHistory = localStorage.getItem('orderHistory')

      const currentOrder = savedOrder ? JSON.parse(savedOrder) : null
      const orderHistory = savedHistory ? JSON.parse(savedHistory) : []

      orderStore.setState({
        currentOrder,
        orderHistory,
      })
    } catch (error) {
      console.error('Error loading order from storage:', error)
    }
  },

  calculateOrderTotals: (
    items: CartItem[],
    deliveryFee: number,
    promoDiscount: number = 0,
    taxRate: number = 0,
  ) => {
    const subtotal = items.reduce((sum, item) => {
      const price =
        typeof item.product.price === 'string'
          ? parseFloat(item.product.price)
          : item.product.price
      return sum + price * item.quantity
    }, 0)

    const taxAmount = subtotal * taxRate
    const total = subtotal + deliveryFee + taxAmount - promoDiscount

    return {
      subtotal,
      taxAmount,
      total,
    }
  },
}
