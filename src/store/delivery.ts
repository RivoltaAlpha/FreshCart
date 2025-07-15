import { Store } from '@tanstack/store'
import type { Delivery } from '@/types/delivery'

interface DeliveryState {
  deliveries: Delivery[]
  selectedDelivery: Delivery | null
}

const initialDeliveryState: DeliveryState = {
  deliveries: [],
  selectedDelivery: null,
}

export const deliveryStore = new Store<DeliveryState>(initialDeliveryState)

export const deliveryActions = {
  setDeliveries: (deliveries: Delivery[]) => {
    deliveryStore.setState({
      ...deliveryStore.state,
      deliveries,
    })
  },

  setSelectedDelivery: (delivery: Delivery | null) => {
    deliveryStore.setState({
      ...deliveryStore.state,
      selectedDelivery: delivery,
    })
  },

  clearSelectedDelivery: () => {
    deliveryStore.setState({
      ...deliveryStore.state,
      selectedDelivery: null,
    })
  },
}
