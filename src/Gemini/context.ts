import { GoogleGenerativeAI } from '@google/generative-ai'

interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
  description?: string
  seller: string
  location: string
  unit: string
  quantity: string
  harvestDate: string
  rating: number
}

interface UserInteraction {
  id: number
  name: string
  category: string
  timestamp: string
  action: 'click' | 'addToCart' | 'order'
}

interface AppContext {
  userPreferences: any
  currentPage: string
  userHistory: any
  appData: {
    products: Product[]
  }
  clickedItems: UserInteraction[]
  cartItems: UserInteraction[]
  mostOrderedItems: UserInteraction[]
  categories: string[]
}

interface Recommendation {
  productId: number
  reason: string
}

interface RecommendationResult {
  recommendations: Recommendation[]
  context: AppContext
  timestamp: string
  type: 'ai-powered' | 'fallback'
}

// Initialize Gemini AI with updated model name
const getApiKey = (): string => {
  // Try to get API key from environment variables first
  const envApiKey = import.meta.env?.VITE_GEMINI_API_KEY

  if (envApiKey) {
    return envApiKey
  }

  // Fallback API key for development (should be replaced with environment variable)
  const fallbackApiKey = 'AIzaSyDvNxPUmA6uA3aQ8suP8529nOZzU_iobC0'

  if (!fallbackApiKey) {
    console.warn(
      'Gemini API key not found. AI recommendations will use fallback logic.',
    )
    return ''
  }

  return fallbackApiKey
}

const apiKey = getApiKey()
console.log(`Gemini API Key loaded: ${apiKey ? 'Yes' : 'No'}`)

// Only initialize AI if we have an API key
let genAI: GoogleGenerativeAI | null = null
let model: any = null

if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey)

    // Updated model name - try these in order of preference
    const getModel = () => {
      try {
        // Try the latest model first
        return genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' })
      } catch {
        try {
          // Fallback to stable model
          return genAI!.getGenerativeModel({ model: 'gemini-2.0-flash' })
        } catch {
          // Last resort fallback
          return genAI!.getGenerativeModel({ model: 'gemini-2.0-flash' })
        }
      }
    }

    model = getModel()
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error)
    console.warn('Will use fallback recommendations only.')
  }
}

// ...existing helper functions...
function getUserPreferences(): any {
  return JSON.parse(localStorage.getItem('userPreferences') || '{}')
}

function getUserInteractionHistory(): any {
  return JSON.parse(localStorage.getItem('userHistory') || '[]')
}

function getRelevantAppData(): { products: Product[] } {
  return JSON.parse(localStorage.getItem('appData') || '{"products": []}')
}

function getClickedItems(): UserInteraction[] {
  return JSON.parse(localStorage.getItem('clickedItems') || '[]')
}

function getCartItems(): UserInteraction[] {
  return JSON.parse(localStorage.getItem('cartItems') || '[]')
}

function getMostOrderedItems(): UserInteraction[] {
  return JSON.parse(localStorage.getItem('mostOrderedItems') || '[]')
}

function getUserPreferredCategories(): string[] {
  const clickedItems = getClickedItems()
  const cartItems = getCartItems()
  const orderedItems = getMostOrderedItems()

  const allItems = [...clickedItems, ...cartItems, ...orderedItems]
  const categories = allItems.map((item) => item.category).filter(Boolean)

  const categoryCount = categories.reduce(
    (acc: Record<string, number>, category: string) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {},
  )

  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category)
}

const appContext: AppContext = {
  userPreferences: getUserPreferences(),
  currentPage: window.location.pathname,
  userHistory: getUserInteractionHistory(),
  appData: getRelevantAppData(),
  clickedItems: getClickedItems(),
  cartItems: getCartItems(),
  mostOrderedItems: getMostOrderedItems(),
  categories: getUserPreferredCategories(),
}

// Generate AI-powered recommendations with improved error handling
const getAIRecommendations = async (
  userContext: AppContext,
): Promise<Recommendation[]> => {
  // If no model available, return fallback immediately
  if (!model || !apiKey) {
    console.log('No Gemini model available, using fallback recommendations')
    return getFallbackRecommendations(userContext)
  }

  try {
    const prompt = `
    Based on the following user behavior data, recommend 5 products that this user might be interested in:
    
    Recently Clicked Items: ${JSON.stringify(userContext.clickedItems.slice(-10))}
    Current Cart Items: ${JSON.stringify(userContext.cartItems)}
    Most Ordered Items: ${JSON.stringify(userContext.mostOrderedItems.slice(-5))}
    Preferred Categories: ${JSON.stringify(userContext.categories)}
    Current Page: ${userContext.currentPage}
    
    Available Products: ${JSON.stringify(userContext.appData.products)}
    
    Please analyze the user's preferences and suggest 5 products they might like to purchase.
    Return the response as a JSON array with product IDs and brief explanations.
    Format: [{"productId": 123, "reason": "why recommended"}]
    
    Important: 
    - Return ONLY the JSON array, no additional text or formatting
    - Product IDs must be numbers, not strings
    - Only recommend products that exist in the Available Products list
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // console.log('AI Response:', text) // Debug log

    // Clean the response text
    const cleanedText = text.replace(/```json|```/g, '').trim()

    try {
      const recommendations = JSON.parse(cleanedText) as Recommendation[]

      // Ensure all productIds are numbers and validate they exist
      const validRecommendations = recommendations
        .map((rec) => ({
          ...rec,
          productId:
            typeof rec.productId === 'string'
              ? parseInt(rec.productId, 10)
              : rec.productId,
        }))
        .filter((rec) => {
          // Check if productId is a valid number and exists in products
          const isValidId = !isNaN(rec.productId) && rec.productId > 0
          const productExists = userContext.appData.products.some(
            (p) => p.id === rec.productId,
          )

          if (!isValidId) {
            console.warn(`Invalid product ID: ${rec.productId}`)
          }
          if (!productExists) {
            console.warn(
              `Product with ID ${rec.productId} not found in products list`,
            )
          }

          return isValidId && productExists
        })

      return validRecommendations.length > 0
        ? validRecommendations
        : getFallbackRecommendations(userContext)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', text)
      return getFallbackRecommendations(userContext)
    }
  } catch (error) {
    console.error('Error getting AI recommendations:', error)
    // Check if it's a network/API error
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes('400') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('quota')
      ) {
        console.warn(
          'API key issue detected, switching to fallback recommendations',
        )
      }
    }
    return getFallbackRecommendations(userContext)
  }
}

// Fallback recommendations (rule-based)
const getFallbackRecommendations = (
  userContext: AppContext,
): Recommendation[] => {
  const { clickedItems, cartItems, mostOrderedItems, appData } = userContext
  const allProducts = appData.products || []

  // Simple rule-based recommendations
  const userInteractedProducts = new Set([
    ...clickedItems.map((item) => item.id),
    ...cartItems.map((item) => item.id),
    ...mostOrderedItems.map((item) => item.id),
  ])

  // If user has interacted with products, recommend from preferred categories
  if (userContext.categories.length > 0) {
    return allProducts
      .filter((product) => !userInteractedProducts.has(product.id))
      .filter((product) => userContext.categories.includes(product.category))
      .slice(0, 5)
      .map((product) => ({
        productId: product.id,
        reason: `Recommended based on your interest in ${product.category}`,
      }))
  }

  // If no categories, just recommend popular items
  return allProducts
    .filter((product) => !userInteractedProducts.has(product.id))
    .slice(0, 5)
    .map((product) => ({
      productId: product.id,
      reason: `Popular ${product.category.toLowerCase()} item`,
    }))
}

const getAppContextWithFallbacks = (): AppContext => {
  const clickedItems = getClickedItems()
  const cartItems = getCartItems()
  const mostOrderedItems = getMostOrderedItems()
  const appData = getRelevantAppData()

  const productsWithFallback: Product[] =
    appData.products.length > 0
      ? appData.products
      : [
          {
            id: 1,
            name: 'Fresh Apples',
            category: 'Fruits',
            price: 3.99,
            image:
              'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
            description: 'Fresh red apples',
            seller: 'Green Farm',
            location: 'Nairobi',
            unit: 'kg',
            quantity: '5 kg',
            harvestDate: '2024-01-15',
            rating: 4.5,
          },
          {
            id: 2,
            name: 'Organic Bananas',
            category: 'Fruits',
            price: 2.49,
            image:
              'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
            description: 'Organic yellow bananas',
            seller: 'Organic Valley',
            location: 'Kisumu',
            unit: 'bunch',
            quantity: '3 bunches',
            harvestDate: '2024-01-20',
            rating: 4.2,
          },
          {
            id: 3,
            name: 'Fresh Spinach',
            category: 'Vegetables',
            price: 1.99,
            image:
              'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
            description: 'Fresh green spinach',
            seller: 'Local Farm',
            location: 'Nakuru',
            unit: 'bunch',
            quantity: '2 bunches',
            harvestDate: '2024-01-18',
            rating: 4.0,
          },
          {
            id: 4,
            name: 'Whole Milk',
            category: 'Dairy',
            price: 4.29,
            image:
              'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
            description: 'Fresh whole milk',
            seller: 'Dairy Co',
            location: 'Eldoret',
            unit: 'liter',
            quantity: '2 liters',
            harvestDate: '2024-01-22',
            rating: 4.8,
          },
          {
            id: 5,
            name: 'Chicken Breast',
            category: 'Meat',
            price: 8.99,
            image:
              'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
            description: 'Fresh chicken breast',
            seller: 'Poultry Farm',
            location: 'Kiambu',
            unit: 'kg',
            quantity: '1 kg',
            harvestDate: '2024-01-21',
            rating: 4.6,
          },
        ]

  // Store sample products in localStorage if no real products exist
  if (appData.products.length === 0) {
    localStorage.setItem(
      'appData',
      JSON.stringify({ products: productsWithFallback }),
    )
  }

  return {
    userPreferences: getUserPreferences(),
    currentPage: window.location.pathname,
    userHistory: getUserInteractionHistory(),
    appData: { products: productsWithFallback },
    clickedItems,
    cartItems,
    mostOrderedItems,
    categories: getUserPreferredCategories(),
  }
}

// Updated getRecommendations function
const getRecommendations = async (
  context?: AppContext,
): Promise<RecommendationResult> => {
  try {
    const contextWithFallbacks = context || getAppContextWithFallbacks()

    // If no user interaction data exists, provide sample recommendations
    if (
      contextWithFallbacks.clickedItems.length === 0 &&
      contextWithFallbacks.cartItems.length === 0 &&
      contextWithFallbacks.mostOrderedItems.length === 0
    ) {
      const sampleRecommendations: Recommendation[] =
        contextWithFallbacks.appData.products.slice(0, 5).map((product) => ({
          productId: product.id,
          reason: `Popular ${product.category.toLowerCase()} item - great for new customers!`,
        }))

      return {
        recommendations: sampleRecommendations,
        context: contextWithFallbacks,
        timestamp: new Date().toISOString(),
        type: 'fallback',
      }
    }

    const aiRecommendations = await getAIRecommendations(contextWithFallbacks)

    return {
      recommendations: aiRecommendations,
      context: contextWithFallbacks,
      timestamp: new Date().toISOString(),
      type: 'ai-powered',
    }
  } catch (error) {
    console.error('Error in getRecommendations:', error)
    const fallbackContext = getAppContextWithFallbacks()
    return {
      recommendations: getFallbackRecommendations(fallbackContext),
      context: fallbackContext,
      timestamp: new Date().toISOString(),
      type: 'fallback',
    }
  }
}

const trackUserInteraction = (
  action: 'click' | 'addToCart' | 'order',
  item: Omit<UserInteraction, 'timestamp' | 'action'>,
): void => {
  const timestamp = new Date().toISOString()
  const interaction: UserInteraction = { ...item, timestamp, action }

  switch (action) {
    case 'click':
      const clickedItems = getClickedItems()
      clickedItems.push(interaction)
      localStorage.setItem(
        'clickedItems',
        JSON.stringify(clickedItems.slice(-50)),
      )
      break
    case 'addToCart':
      const cartItems = getCartItems()
      cartItems.push(interaction)
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
      break
    case 'order':
      const mostOrderedItems = getMostOrderedItems()
      mostOrderedItems.push(interaction)
      localStorage.setItem('mostOrderedItems', JSON.stringify(mostOrderedItems))
      break
  }
}

// Utility function to seed sample data for testing
const seedSampleUserData = (): void => {
  const hasExistingData =
    getClickedItems().length > 0 ||
    getCartItems().length > 0 ||
    getMostOrderedItems().length > 0

  if (!hasExistingData) {
    console.log('Seeding sample user interaction data for testing...')

    // Simulate some user interactions
    const sampleInteractions = [
      { id: 1, name: 'Fresh Apples', category: 'Fruits' },
      { id: 3, name: 'Fresh Spinach', category: 'Vegetables' },
      { id: 4, name: 'Whole Milk', category: 'Dairy' },
      { id: 2, name: 'Organic Bananas', category: 'Fruits' },
      { id: 5, name: 'Chicken Breast', category: 'Meat' },
    ]

    // Simulate clicks
    sampleInteractions.forEach((item, index) => {
      if (index < 4) trackUserInteraction('click', item)
    })

    // Simulate adding to cart
    trackUserInteraction('addToCart', sampleInteractions[0])
    trackUserInteraction('addToCart', sampleInteractions[2])

    // Simulate orders
    trackUserInteraction('order', sampleInteractions[1])

    console.log('Sample user data seeded successfully')
  }
}

export {
  getRecommendations,
  trackUserInteraction,
  getAIRecommendations,
  appContext,
  seedSampleUserData,
}

export type {
  Product,
  UserInteraction,
  AppContext,
  Recommendation,
  RecommendationResult,
}
