import { getUserPurchases } from '@/services/orderService'
import { loggedInUser } from '@/store/auth'
import type { StoreProduct } from '@/types/store'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useNavigate, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useMemo } from 'react';

export const Route = createFileRoute('/customer/ai-recommendations')({
  component: RouteComponent,
})

// Types for AI responses
interface Recipe {
  name: string
  image: string
  ingredients: string[]
  instructions: string[]
  cookingTime: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

interface ProductRecommendation {
  name: string
  reason: string
  image: string
  category: string
}

interface AIResponse {
  recipes: Recipe[]
  productRecommendations: ProductRecommendation[]
}

// Gemini AI service
class GeminiService {
  private static instance: GeminiService
  private lastRequestTime: number = 0
  private readonly MIN_REQUEST_INTERVAL = 4000 // 4 seconds between requests

  // Instance method to get API key
  private getApiKey(): string {
    const envApiKey = import.meta.env?.VITE_GEMINI_API_KEY
    console.log(`Gemini API Key from env: ${envApiKey ? 'Yes' : 'No'}`)
    return envApiKey
  }

  private apiKey: string
  private genAI: GoogleGenerativeAI | null = null
  model: any = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || this.getApiKey()
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey)

      // Updated model name - try these in order of preference
      const getModel = () => {
        try {
          return this.genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' })
        } catch {
          try {
            return this.genAI!.getGenerativeModel({ model: 'gemini-2.0-flash' })
          } catch {
            return this.genAI!.getGenerativeModel({ model: 'gemini-1.5-flash' })
          }
        }
      }

      this.model = getModel()
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error)
      console.warn('Will use fallback recommendations only.')
    }
  }

  // Singleton pattern to prevent multiple instances
  static getInstance(apiKey?: string): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService(apiKey)
    }
    return GeminiService.instance
  }

  // Rate limiting method
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
  }

  async generateRecommendations(
    purchasedProducts: string,
  ): Promise<AIResponse> {
    // Apply rate limiting
    await this.waitForRateLimit()

    const prompt = `
Based on these recent purchases: ${purchasedProducts}

Please provide:
1. 3 recipe recommendations that use these products or similar ingredients
2. 4 product recommendations that would complement these purchases
3. An image URL for each recipe from the internet

Format your response as JSON with this structure:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "image": "https://via.placeholder.com/400x300?text=Ingredient1+Image",
      "ingredients": ["ingredient1", "ingredient2", "ingredient3", ...],
      "instructions": ["step1", "step2", "step3", "step4", "step5", ...],
      "cookingTime": "30 minutes",
      "difficulty": "Easy"
    }
  ],
  "productRecommendations": [
    {
      "name": "Product Name",
      "reason": "Why this product complements your purchases",
      "category": "Product Category"
    }
  ]
}
  Important:
  -the image URL should be a valid link to an image of any ingredient in the recipe
  - Only use image URLs that are public and hotlinkable (e.g., from unsplash.com, pexels.com, or via.placeholder.com).
  -the ingredients and instructions should be concise and relevant
  -the cooking time should be realistic for the recipe
  -the difficulty should be one of: Easy, Medium, Hard
  -the product recommendations should be relevant to the purchases
  -each recipe should be for a single product not for combining everything if possible
  -the product recommendations should be for products that are available in the store
  -categories should be relevant to the product recommendations

Only return valid JSON, no additional text.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const cleanedText = text
        .replace(/```json\n?/g, ``)
        .replace(/```/g, ``)
        .trim()

      const parsed: AIResponse = JSON.parse(cleanedText)
      return parsed
    } catch (error: any) {
      // Handle Gemini API rate limit errors (429)
      if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        throw new Error('You have exceeded your Gemini API quota. Please wait a few minutes before trying again, or check your plan and billing details.');
      }
      console.error('Error parsing AI response:', error)
      // Return a fallback empty response
      return {
        recipes: [],
        productRecommendations: [],
      }
    }
  }
}

function RouteComponent() {
  const geminiService = useMemo(() => GeminiService.getInstance(import.meta.env.VITE_GEMINI_API_KEY || ''), []);
  const navigate = useNavigate()
  const user = loggedInUser()
  const [purchasedProducts, setPurchasedProducts] = useState<StoreProduct[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs to prevent duplicate requests
  const hasGeneratedRecommendations = useRef(false)
  const currentRequestRef = useRef<Promise<void> | null>(null)

  // Fetch purchases asynchronously
  useEffect(() => {
    async function fetchPurchases() {
      if (user?.user_id) {
        try {
          const products = await getUserPurchases(parseInt(user.user_id))
          setPurchasedProducts(products)
        } catch (error) {
          console.error('Error fetching purchases:', error)
          setError('Failed to load your purchases')
        }
      }
    }
    fetchPurchases()
  }, [user])

  // Memoized recommendation generation function
  const generateRecommendations = useCallback(async (products: StoreProduct[]) => {
    if (products.length === 0) return
    if (currentRequestRef.current) return // Prevent concurrent requests

    setLoading(true)
    setError(null)

    const requestPromise = (async () => {
      try {
        const recentPurchases = products.slice(0, 6)
        const recentPurchaseNames = recentPurchases
          .map((product) => product.name)
          .join(', ')

        const recommendations = await geminiService.generateRecommendations(recentPurchaseNames)
        setAiRecommendations(recommendations)
        hasGeneratedRecommendations.current = true
      } catch (error: any) {
        console.error('Error generating recommendations:', error)
        if (error?.message?.includes('quota')) {
          setError(error.message)
        } else {
          setError('Failed to generate AI recommendations. Please try again.')
        }
      } finally {
        setLoading(false)
        currentRequestRef.current = null
      }
    })()

    currentRequestRef.current = requestPromise
    await requestPromise
  }, [geminiService])

  // Generate AI recommendations when purchases are loaded (only once)
  useEffect(() => {
    if (purchasedProducts.length > 0 && !hasGeneratedRecommendations.current && !loading) {
      generateRecommendations(purchasedProducts)
    }
  }, [purchasedProducts, generateRecommendations, loading])

  const handleRetryRecommendations = async () => {
    if (purchasedProducts.length === 0) return

    // Reset the flag to allow regeneration
    hasGeneratedRecommendations.current = false
    await generateRecommendations(purchasedProducts)
  }

  // search product image from 1 of the ingredients in our products by returning a product then passing it's image
  const getProductImage = (recipe: Recipe) => {
    const ingredient = recipe.ingredients[0]
    const product = purchasedProducts.find(p => p.name.toLowerCase().includes(ingredient.toLowerCase()))
    return product ? product.image_url : 'https://via.placeholder.com/400x300?text=No+Image'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your orders.
          </p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Recommendations
          </h1>
          <p className="text-gray-600">
            Personalized recipe and product recommendations based on your recent purchases
          </p>
        </div>

        {/* Recent Purchases Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Recent Purchases
          </h2>
          {purchasedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {purchasedProducts.slice(0, 6).map((product, index) => (
                <div key={index} className="bg-gray-300 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent purchases found.</p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A7B3] mx-auto mb-4"></div>
            <p className="text-gray-600">Generating AI recommendations...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait, this may take a moment due to rate limiting.</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={handleRetryRecommendations}
                disabled={loading}
                className="bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {aiRecommendations && !loading && (
          <div className="space-y-8">
            {/* Recipe Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recipe Recommendations
                </h2>
                <button
                  onClick={handleRetryRecommendations}
                  disabled={loading}
                  className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiRecommendations.recipes.map((recipe, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4"
                  >
                    {recipe.image && (
                      <img
                        src={getProductImage(recipe)}
                        alt={recipe.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "https://www.pixelstalk.net/wp-content/uploads/2016/08/Desktop-Food-Images-Download.jpg";
                        }}
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {recipe.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>⏱️ {recipe.cookingTime}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${recipe.difficulty === 'Easy'
                          ? 'bg-green-100 text-green-800'
                          : recipe.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {recipe.difficulty}
                      </span>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 mb-1">
                        Ingredients:
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, i) => (
                          <li key={i}>• {ingredient}</li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li className="text-gray-500">
                            ... and {recipe.ingredients.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">
                        Instructions:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recipe.instructions[0]}
                        {recipe.instructions.length > 1 && '...'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Product Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecommendations.productRecommendations.map(
                  (product, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{product.reason}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* No Purchases State */}
        {purchasedProducts.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Recent Purchases
            </h3>
            <p className="text-gray-600 mb-6">
              Make some purchases to get personalized AI recommendations for recipes and products.
            </p>
            <button
              onClick={() => navigate({ to: '/store' })}
              className="bg-[#00A7B3] hover:bg-[#00A7B3]/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}