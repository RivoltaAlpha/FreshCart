import type { CreateProduct, Product, Products } from '@/types/types'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '@/services/productService'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { getStoreProducts } from '@/services/storeService'

export const useProducts = (): UseQueryResult<Products[], Error> => {
  return useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  })
}

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['createProduct'],
    mutationFn: createProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useUpdateProduct = (
  id: number,
): UseMutationResult<Product, Error, CreateProduct> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updateProduct', id],
    mutationFn: (productData: CreateProduct) => updateProduct(id, productData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export const useDeleteProduct = (
  id: number,
): UseMutationResult<void, Error> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['deleteProduct', id],
    mutationFn: () => deleteProduct(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
// store products
export const useStoreProducts = (storeId: number) => {
  return useQuery({
    queryKey: ['storeProducts', storeId],
    queryFn: () => getStoreProducts(storeId),
    enabled: !!storeId,
  })
}
