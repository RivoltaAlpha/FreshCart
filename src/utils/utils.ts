// const getApiKey = (): string => {
//   const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL
//   console.log(`Backend URL from env: ${BACKEND_URL ? 'Yes' : 'No'}`)
//   return BACKEND_URL
// }
export const url = import.meta.env?.VITE_BACKEND_URL
export const FRONTEND_URL = import.meta.env?.VITE_FRONTEND_URL