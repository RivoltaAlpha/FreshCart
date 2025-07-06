import type { Inventory, CreateInventory } from '../types/types';
import { getAllInventories, getInventoryById, createInventory, updateInventory, deleteInventory } from '@/services/inventoryService';
import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

export const useInventories = (): UseQueryResult<Inventory[], Error> => {
    return useQuery({
        queryKey: ["inventories"],
        queryFn: getAllInventories,
    });
};
export const useInventory = (id: number) => {
    return useQuery({
        queryKey: ["inventories", id],
        queryFn: () => getInventoryById(id),
        enabled: !!id,
    });
};
export const useCreateInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createInventory"],
        mutationFn: createInventory,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventories"] });
        },
    });
};
export const useUpdateInventory = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateInventory", id],
        mutationFn: (inventoryData: CreateInventory) => updateInventory(id, inventoryData),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventories"] });
        },
    });
};
export const useDeleteInventory = (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["deleteInventory", id],
        mutationFn: () => deleteInventory(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventories"] });
        },
    });
};

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

// export const useInventoryProducts = (inventory_id: number) => {
//     return useQuery({
//         queryKey: ["inventoryProducts", inventory_id],
//         queryFn: () => getInventoryProducts(inventory_id),
//         enabled: !!inventory_id,
//     });
// };
