import { useState, useEffect, useCallback } from 'react';
import type { Store, StoreProduct, StoreProductsResponse, StoresResponse } from '../types/store';
import storeService from '../services/storeService';

interface UseStoreProductsParams {
  storeId: number;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseStoreProductsReturn {
  products: StoreProduct[];
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  hasMore: boolean;
  fetchProducts: () => Promise<void>;
  searchProducts: (query: string, categoryId?: number) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useStoreProducts = ({
  storeId,
  page = 1,
  limit = 20,
  autoFetch = true
}: UseStoreProductsParams): UseStoreProductsReturn => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(page);

  const fetchProducts = useCallback(async (pageToFetch = 1, append = false) => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await storeService.getStoreProducts(storeId, pageToFetch, limit);
      
      if (append) {
        setProducts(prev => [...prev, ...response.products]);
      } else {
        setProducts(response.products);
      }
      
      setTotal(response.total);
      setCurrentPage(pageToFetch);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(errorMessage);
      console.error('Error fetching store products:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId, limit]);

  const searchProducts = useCallback(async (query: string, categoryId?: number) => {
    if (!storeId || !query.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await storeService.searchStoreProducts(storeId, query, categoryId);
      setProducts(response.products);
      setTotal(response.total);
      setCurrentPage(1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search products';
      setError(errorMessage);
      console.error('Error searching store products:', err);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const loadMore = useCallback(async () => {
    if (loading || products.length >= total) return;
    await fetchProducts(currentPage + 1, true);
  }, [loading, products.length, total, currentPage, fetchProducts]);

  const refresh = useCallback(async () => {
    await fetchProducts(1, false);
  }, [fetchProducts]);

  useEffect(() => {
    if (autoFetch && storeId) {
      fetchProducts();
    }
  }, [storeId, autoFetch, fetchProducts]);

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
    refresh
  };
};

interface UseStoresReturn {
  stores: Store[];
  loading: boolean;
  error: string | null;
  fetchStores: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useStores = (): UseStoresReturn => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await storeService.getAllStores();
      setStores(response.stores);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stores';
      setError(errorMessage);
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return {
    stores,
    loading,
    error,
    fetchStores,
    refresh
  };
};

export const storeInventories = (storeId: number): UseStoreProductsReturn => {
  const { products, loading, error, total, currentPage, hasMore, fetchProducts, searchProducts, loadMore, refresh } = useStoreProducts({
    storeId,
    autoFetch: true
  });

  return {
    products,
    loading,
    error,
    total,
    currentPage,
    hasMore,
    fetchProducts,
    searchProducts,
    loadMore,
    refresh
  };
}