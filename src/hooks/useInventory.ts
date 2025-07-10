import type { Inventory, CreateInventory } from '../types/types'
import {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getInventoryProducts,
  getStoreInventories,
  addProductToInventory,
} from '@/services/inventoryService'
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  type UseQueryResult,
} from '@tanstack/react-query'

export const useInventories = (): UseQueryResult<Inventory[], Error> => {
  return useQuery({
    queryKey: ['inventories'],
    queryFn: getAllInventories,
  })
}
export const useInventory = (id: number) => {
  return useQuery({
    queryKey: ['inventories', id],
    queryFn: () => getInventoryById(id),
    enabled: !!id,
  })
}
export const useCreateInventory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['createInventory'],
    mutationFn: createInventory,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
    },
  })
}
export const useUpdateInventory = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updateInventory', id],
    mutationFn: (inventoryData: CreateInventory) =>
      updateInventory(id, inventoryData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
    },
  })
}
export const useDeleteInventory = (id: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['deleteInventory', id],
    mutationFn: () => deleteInventory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] })
    },
  })
}

// export const useUpdateInventoryStock = (id: number) => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationKey: ["updateInventoryStock", id],
//         mutationFn: (stockData: UpdateStock) => updateInventoryStock(id, stockData),

//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["inventories"] });
//         },
//     });
// };

export const useInventoryProducts = (inventory_id: number) => {
  const query = useSuspenseQuery({
    queryKey: ['inventoryProducts', inventory_id],
    queryFn: () => getInventoryProducts(inventory_id),
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  }
}

// store inventories
export const useStoreInventoryProducts = (storeId: number) => {
  return useQuery({
    queryKey: ['storeInventoryProducts', storeId],
    queryFn: () => getStoreInventories(storeId),
    enabled: !!storeId,
  })
}

// Add product to inventory
export const useAddProductToInventory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['addProductToInventory'],
    mutationFn: ({
      inventory_id,
      product_id,
    }: {
      inventory_id: number
      product_id: number
    }) => addProductToInventory(inventory_id, product_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] })
      queryClient.invalidateQueries({ queryKey: ['storeInventoryProducts'] })
    },
  })
}
