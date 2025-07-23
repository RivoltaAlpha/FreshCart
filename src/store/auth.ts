import { refreshTokens } from '@/services/authService'
import { UserRole, type backendResponse } from '@/types/types'
import { Store } from '@tanstack/store'
import { jwtDecode } from 'jwt-decode'

const intialStorage: backendResponse = {
  isAuthenticated: false,
  tokens: {
    accessToken: '',
    refreshToken: '',
  },
  user: {
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    role: UserRole.Customer,
  },
}

export const authStore = new Store<backendResponse>(intialStorage)

export const localStorageJson = () => {
  const localData = localStorage.getItem('auth')
  let jsonData
  if (localData) jsonData = JSON.parse(localData)
  return jsonData
}

export const isAuthenticated = () => {
  const localData = localStorageJson()
  if (!localData) return false
  return localData.isAuthenticated
}

export const loggedInUser = () => {
  const localData = localStorageJson()
  if (!localData) return null
  // console.log('local data user', localData.user)
  return localData.user
}

export const authActions = {
  saveUser: (data: backendResponse) => {
    authStore.setState({
      isAuthenticated: data.isAuthenticated,
      tokens: data.tokens,
      user: data.user,
    })
    localStorage.setItem(
      'auth',
      JSON.stringify({ ...data, isAuthenticated: true }),
    )
  },
  deleteUser: () => {
    authStore.setState(intialStorage)
    localStorage.removeItem('auth')
  },
  intializeUser: () => {
    const userData = localStorage.getItem('auth')
    console.log('userData localstorage', userData)
    if (!userData) return
    const json_data = JSON.parse(userData)
    console.log('json data user', json_data)
    authStore.setState(json_data)
  },
  // saving new access token
  saveAccessToken: (token: string) => {
    const localData = localStorageJson()
    if (!localData) return
    const updated = {
      ...localData,
      tokens: {
        ...localData.tokens,
        accessToken: token,
      },
    }
    authStore.setState(updated)
    localStorage.setItem('auth', JSON.stringify(updated))
  },
}

export const getAccessToken = () => {
  const localData = localStorageJson()
  if (!localData) return ''
  return localData.tokens.accessToken
}

export const getRefreshToken = () => {
  const localData = localStorageJson()
  if (!localData) return ''
  return localData.tokens.refreshToken
}

export const getUserId = () => {
  const user = loggedInUser()
  if (!user) return ''
  return user.user_id
}

export const decodeAccessToken = (token: string) => {
  try {
    return jwtDecode(token)
  } catch (e) {
    return null
  }
}

export const isTokenExpired = (token: string) => {
  const decoded: any = decodeAccessToken(token)
  if (!decoded || !decoded.exp) return true
  return Date.now() >= decoded.exp * 1000
}
console.log('Is token expired:', isTokenExpired(getAccessToken()))

export const ensureValidAccessToken = async () => {
  const accessToken = getAccessToken();
  const refreshTokenValue = getRefreshToken();
  const userId = getUserId();

  if (!accessToken || isTokenExpired(accessToken)) {
    if (refreshTokenValue && userId) {
      try {
        const data = await refreshTokens(userId, refreshTokenValue);
        authActions.saveAccessToken(data.accessToken);
        return data.accessToken;
      } catch (e) {
        authActions.deleteUser();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      authActions.deleteUser();
      throw new Error('No refresh token available.');
    }
  }
  return accessToken;
};
