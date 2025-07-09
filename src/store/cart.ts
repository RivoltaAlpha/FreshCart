import { Store } from '@tanstack/store'
import type { Product } from '@/types/types'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
}

const initialCartState: CartState = {
  items: [],
}

export const cartStore = new Store<CartState>(initialCartState)

export const cartActions = {
  addToCart: (product: Product, quantity: number = 1) => {
    const currentItems = cartStore.state.items
    const existingItemIndex = currentItems.findIndex(
      (item) => item.product.product_id === product.product_id,
    )

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...currentItems]
      updatedItems[existingItemIndex].quantity += quantity
      cartStore.setState({ items: updatedItems })
    } else {
      // Add new item
      cartStore.setState({
        items: [...currentItems, { product, quantity }],
      })
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cartStore.state))
  },

  removeFromCart: (productId: number) => {
    const currentItems = cartStore.state.items
    const updatedItems = currentItems.filter(
      (item) => item.product.product_id !== productId,
    )
    cartStore.setState({ items: updatedItems })
    localStorage.setItem('cart', JSON.stringify(cartStore.state))
  },

  updateQuantity: (productId: number, quantity: number) => {
    if (quantity <= 0) {
      cartActions.removeFromCart(productId)
      return
    }

    const currentItems = cartStore.state.items
    const updatedItems = currentItems.map((item) =>
      item.product.product_id === productId ? { ...item, quantity } : item,
    )
    cartStore.setState({ items: updatedItems })
    localStorage.setItem('cart', JSON.stringify(cartStore.state))
  },

  clearCart: () => {
    cartStore.setState({ items: [] })
    localStorage.removeItem('cart')
  },

  loadFromStorage: () => {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        const cartData = JSON.parse(saved)
        cartStore.setState(cartData)
      } catch (error) {
        console.error('Error loading cart from storage:', error)
      }
    }
  },

  getCartTotal: () => {
    return cartStore.state.items.reduce((total, item) => {
      const price =
        typeof item.product.price === 'string'
          ? parseFloat(item.product.price)
          : item.product.price
      return total + price * item.quantity
    }, 0)
  },

  getCartCount: () => {
    return cartStore.state.items.reduce(
      (count, item) => count + item.quantity,
      0,
    )
  },
}
