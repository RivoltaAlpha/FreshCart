import { useState, useEffect, useCallback } from 'react'
import type { Store } from '../types/store'
import type { Product } from '../types/types'
import { getAllStores, getStoreProducts } from '@/services/storeService'
import { useQuery } from '@tanstack/react-query'

interface UseStoreProductsParams {
  storeId: number
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface UseStoreProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  hasMore: boolean
  fetchProducts: () => Promise<void>
  searchProducts: (query: string, categoryId?: number) => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export const useStoreProducts = ({
  storeId,
  page = 1,
  limit = 20,
  autoFetch = true,
}: UseStoreProductsParams): UseStoreProductsReturn => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(page)

  const fetchProducts = useCallback(
    async (pageToFetch = 1, append = false) => {
      if (!storeId) return

      setLoading(true)
      setError(null)

      try {
        const response = await getStoreProducts(storeId)

        if (append) {
          setProducts((prev) => [...prev, ...response])
        } else {
          setProducts(response)
        }

        setTotal(response.length)
        setCurrentPage(pageToFetch)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch products'
        setError(errorMessage)
        console.error('Error fetching store products:', err)
      } finally {
        setLoading(false)
      }
    },
    [storeId, limit],
  )

  const searchProducts = useCallback(
    async (query: string, _categoryId?: number) => {
      if (!storeId || !query.trim()) return

      setLoading(true)
      setError(null)

      try {
        // For now, just filter existing products instead of making a new API call
        // This can be enhanced later with a proper search endpoint
        const filtered = products.filter((product) =>
          product.name.toLowerCase().includes(query.toLowerCase()),
        )
        setProducts(filtered)
        setTotal(filtered.length)
        setCurrentPage(1)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to search products'
        setError(errorMessage)
        console.error('Error searching store products:', err)
      } finally {
        setLoading(false)
      }
    },
    [storeId, products],
  )

  const loadMore = useCallback(async () => {
    if (loading || (products?.length || 0) >= total) return
    await fetchProducts(currentPage + 1, true)
  }, [loading, products?.length, total, currentPage, fetchProducts])

  const refresh = useCallback(async () => {
    await fetchProducts(1, false)
  }, [fetchProducts])

  useEffect(() => {
    if (autoFetch && storeId) {
      fetchProducts()
    }
  }, [storeId, autoFetch, fetchProducts])

  return {
    products,
    loading,
    error,
    total,
    currentPage,
    hasMore: (products?.length || 0) < total,
    fetchProducts: () => fetchProducts(),
    searchProducts,
    loadMore,
    refresh,
  }
}

interface UseStoresReturn {
  stores: Store[]
  loading: boolean
  error: string | null
  fetchStores: () => Promise<void>
  refresh: () => Promise<void>
}

export const useStore = (): UseStoresReturn => {
  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['stores'],
    queryFn: getAllStores,
  })

  const fetchStores = useCallback(async () => {
    try {
      await refetch()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch stores'
      console.error('Error fetching stores:', errorMessage)
      throw new Error(errorMessage)
    }
  }, [refetch])

  const refresh = async () => {
    await fetchStores()
  }

  // Extract stores array from the response
  const stores: Store[] = (() => {
    if (!data) return []

    // If data is directly an array (your actual API response)
    if (Array.isArray(data)) {
      return data
    }

    // If data is StoresResponse object with stores property
    if (
      typeof data === 'object' &&
      'stores' in data &&
      Array.isArray(data.stores)
    ) {
      return data.stores
    }

    // Fallback to empty array
    return []
  })()

  return {
    stores,
    loading: isLoading,
    error: isError
      ? queryError instanceof Error
        ? queryError.message
        : 'Failed to fetch stores'
      : null,
    fetchStores,
    refresh,
  }
}
