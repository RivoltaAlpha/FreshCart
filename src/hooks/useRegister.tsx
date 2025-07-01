import type { CreateUser, LoginResponse } from "@/types/types";
import { authActions } from "@/store/auth";
import { useMutation } from "@tanstack/react-query";
import { signUp } from "@/services/authService";

export function useRegister() {
    const mutation = useMutation<LoginResponse, Error, CreateUser>({
        mutationKey: ['register'],
        mutationFn: (userData: CreateUser) => signUp(userData),
        onSuccess: (data) => {
            console.log('response from login', data)
            const backendData = {
                isAuthenticated: true,
                user: data.user,
                tokens: data.tokens,
            };
            authActions.saveUser(backendData);
        },
    });

    return mutation;
}
