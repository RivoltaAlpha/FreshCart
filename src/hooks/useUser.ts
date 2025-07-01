import type { CreateUser, User } from '../types/types'
import { getAllUsers, getUserById, createUser,updateUser, deleteUser } from '@/services/userService'
import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useUsers = (): UseQueryResult<User[], Error> => {
    return useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers,
    })
}

export const useUser = (id: number) => {
    return useQuery({
        queryKey: ["users", id],
        queryFn: () => getUserById(id),
        enabled: !!id,
    })
}

export const useCreateUser = (): UseMutationResult<User, Error, CreateUser> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["createUser"],
        mutationFn: createUser,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export const useUpdateUser = (id: number, userData: CreateUser) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["updateUser", id],
        mutationFn: () => updateUser(id, userData),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export const useDeleteUser = (id: number) => {
    const queryClient = useQueryClient();
    const { isPending: isDeleting, mutate: deleteUserMutate } = useMutation({
        mutationKey: ["deleteUser", id],
        mutationFn: (id: number) => deleteUser(id),
        
        onError: (error: any) => {
            toast.error(`Error: ${error.message}`);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    return { isDeleting, mutate: deleteUserMutate }
}

export default useUser

