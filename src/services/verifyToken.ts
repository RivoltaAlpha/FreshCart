import { jwtDecode } from "jwt-decode";
import { authActions, authStore } from "@/store/auth"
import { refreshToken } from "./authService";

interface JwtPayload {
  exp: number
  [key: string]: any
}

const checkTokenExpired = (token:string) => {
  try {
    const decode = jwtDecode<JwtPayload>(token) //seconds
    const now = Math.floor(Date.now() / 1000) //seconds
    return decode.exp < now
  } catch (error) {
    return true 
  }
}

export const verifyToken = async () => {
  const tokens = authStore.state.tokens
  if (!tokens.accessToken || !tokens.refreshToken) {
    authActions.deleteUser()
    return null
  }
  const isTokenExpired = checkTokenExpired(tokens.accessToken)
  if (!isTokenExpired) {
    return tokens.accessToken
  }
  try {
    console.log('Getting new access token')
    const newToken = await refreshToken()
    authStore.state.tokens.accessToken = newToken
    return newToken
  } catch (error) {
    authActions.deleteUser()
    console.error('error from getting tokens',error)
  }

}