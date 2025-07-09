import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '@/services/categoriesService'
import type { Category, CreateCategory } from '@/types/types'

export const useCategories = (): UseQueryResult<Category[], Error> => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    retry: (failureCount, error) => {
      // Don't retry if it's an authentication error
      if (
        error?.message?.includes('No authentication token found') ||
        error?.message?.includes('401') ||
        error?.message?.includes('unauthorized')
      ) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: 1000,
  })
}

export const useCategory = (id: number): UseQueryResult<Category, Error> => {
  return useQuery<Category>({
    queryKey: ['categories', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  })
}

export const useCreateCategory = (): UseMutationResult<
  Category,
  Error,
  CreateCategory
> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['createCategory'],
    mutationFn: (categoryData: CreateCategory) => createCategory(categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useUpdateCategory = (
  id: number,
): UseMutationResult<Category, Error, CreateCategory> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['updateCategory', id],
    mutationFn: (categoryData: CreateCategory) =>
      updateCategory(id, categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export const useDeleteCategory = (
  id: number,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['deleteCategory', id],
    mutationFn: () => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
