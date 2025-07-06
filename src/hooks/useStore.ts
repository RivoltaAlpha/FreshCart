import { useState, useEffect, useCallback } from 'react'
import type { Store, StoreProduct } from '../types/store'
import { getAllStores, getStoreProducts, searchStoreProducts } from '@/services/storeService'
import { useQuery } from '@tanstack/react-query'

interface UseStoreProductsParams {
  storeId: number
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface UseStoreProductsReturn {
  products: StoreProduct[]
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
  const [products, setProducts] = useState<StoreProduct[]>([])
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
        const response = await getStoreProducts(
          storeId,
        )

        if (append) {
          setProducts((prev) => [...prev, ...response.products])
        } else {
          setProducts(response.products)
        }

        setTotal(response.total)
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
    async (query: string, categoryId?: number) => {
      if (!storeId || !query.trim()) return

      setLoading(true)
      setError(null)

      try {
        const response = await searchStoreProducts(
          storeId,
          query,
          categoryId,
        )
        setProducts(response.products)
        setTotal(response.total)
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
    [storeId],
  )

  const loadMore = useCallback(async () => {
    if (loading || products.length >= total) return
    await fetchProducts(currentPage + 1, true)
  }, [loading, products.length, total, currentPage, fetchProducts])

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
    hasMore: products.length < total,
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
  console.log("useStores data:", data)

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
    if (typeof data === 'object' && 'stores' in data && Array.isArray(data.stores)) {
      return data.stores
    }
    
    // Fallback to empty array
    return []
  })()

  return {
    stores,
    loading: isLoading,
    error: isError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch stores') : null,
    fetchStores,
    refresh,
  }
}
