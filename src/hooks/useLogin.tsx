import { login } from "@/services/authService"
import { authActions } from "@/store/auth"
import type { LoginResponse, LoginType } from "@/types/types"
import { useMutation } from "@tanstack/react-query"

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginType>({
    mutationKey: ['login'],
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      console.log('response from login', data)
      const backendData = {
        isAuthenticated: true,
        user: data.user,
        tokens: data.tokens,
      };
      authActions.saveUser(backendData);
    },
    onError: (error) => {
      console.error(error)
    }
  })
}