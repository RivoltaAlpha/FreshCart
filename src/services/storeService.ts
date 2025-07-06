import type { Store, StoreProduct, StoreProductsResponse, StoresResponse } from '../types/store';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class StoreService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Store API Error:', error);
      throw error;
    }
  }

  /**
   * Get all stores
   */
  async getAllStores(): Promise<StoresResponse> {
    return this.fetchWithErrorHandling<StoresResponse>(`${API_BASE_URL}/stores/all`);
  }

  /**
   * Get all products for a specific store
   */
  async getStoreProducts(storeId: number, page = 1, limit = 20): Promise<StoreProductsResponse> {
    const url = `${API_BASE_URL}/products/store/${storeId}?page=${page}&limit=${limit}`;
    return this.fetchWithErrorHandling<StoreProductsResponse>(url);
  }

  /**
   * Get store by ID
   */
  async getStoreById(storeId: number): Promise<Store> {
    return this.fetchWithErrorHandling<Store>(`${API_BASE_URL}/stores/${storeId}`);
  }

  /**
   * Search products within a store
   */
  async searchStoreProducts(
    storeId: number, 
    query: string, 
    categoryId?: number,
    page = 1,
    limit = 20
  ): Promise<StoreProductsResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }
    
    const url = `${API_BASE_URL}/products/store/${storeId}/search?${params}`;
    return this.fetchWithErrorHandling<StoreProductsResponse>(url);
  }
}

export const storeService = new StoreService();
export default storeService;