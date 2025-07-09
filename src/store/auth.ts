import { UserRole, type backendResponse } from "@/types/types";
import { Store } from "@tanstack/store";

const intialStorage: backendResponse = {
  isAuthenticated:false,
  tokens: {
    accessToken: '',
    refreshToken:''
  },
  user: {
    user_id: '',
    first_name: '',
    last_name: '',
    email: '',
    role: UserRole.Customer
  }
}

export const authStore = new Store<backendResponse>(intialStorage)

export const localStorageJson = () => {
  const localData = localStorage.getItem('auth')
  let jsonData;
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
  saveUser: (data:backendResponse) => {
    authStore.setState({
      isAuthenticated: data.isAuthenticated,
      tokens: data.tokens,
      user:data.user
    })
    localStorage.setItem('auth',JSON.stringify({...data,isAuthenticated:true}))
  },
  deleteUser: () => {
    authStore.setState(intialStorage)
    localStorage.removeItem('auth')
  },
  intializeUser: () => {
    const userData = localStorage.getItem('auth')
    console.log('userData localstorage',userData)
    if (!userData) return
    const json_data = JSON.parse(userData)
    console.log('json data user',json_data)
    authStore.setState(json_data)
  },
  // saving new access token
  saveAccessToken: (token: string) => {
    console.log('data from localstorage',localStorageJson)
    console.log('received token', token)
    console.log('state before update',authStore.state)

    // authStore.setState(authStore.state);
    // localStorage.setItem('auth', JSON.stringify(authStore.state));
  }

}

