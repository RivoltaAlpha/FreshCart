import { type StoreDetails } from '@/types/store'
import { Store } from '@tanstack/store'

const store: StoreDetails = {
  store_id: 0,
  owner: {
    user_id: 0,
    profile: {
      first_name: '',
      last_name: '',
      phone_number: '',
    },
    email: '',
  },
  name: '',
  town: '',
  county: '',
  contact_info: '',
  store_code: '',
  delivery_fee: 0,
}

export const storesStore = new Store<StoreDetails>(store)

export const localStorageJson = () => {
  const localData = localStorage.getItem('selectedStore')
  let jsonData
  if (localData) jsonData = JSON.parse(localData)
  return jsonData
}

export const storeActions = {
  saveStore: (data: StoreDetails) => {
    storesStore.setState({
      store_id: data.store_id,
      owner_id: data.owner_id,
      name: data.name,
      county: data.county || '',
      town: data.town || '',
      contact_info: data.contact_info,
      store_code: data.store_code || '',
      delivery_fee: data.delivery_fee || 0,
    })
    localStorage.setItem('selectedStore', JSON.stringify(data))
  },

  deleteStore: () => {
    storesStore.setState(store)
    localStorage.removeItem('selectedStore')
  },
}
// export const getSelectedStore = () => {
//   const localData = localStorageJson()
//   if (!localData) return null
//   return localData as StoreDetails
// }
