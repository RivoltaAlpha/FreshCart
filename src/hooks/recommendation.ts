import { useState, useEffect } from 'react'
import { getRecommendations, seedSampleUserData } from '../Gemini/context'

interface Recommendation {
  productId: number
  reason: string
}

interface UseRecommendationsReturn {
  recommendations: Recommendation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const result = await getRecommendations()
      console.log('Hook received recommendations result:', result)
      setRecommendations(result.recommendations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    seedSampleUserData()
    fetchRecommendations()
  }, [])

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
  }
}
