import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AnalysisData {
  prediction: number
  prediction_label: string
  confidence: number
  confidence_percentage: string
  probability_healthy: number
  probability_pd: number
  top_features: Array<{
    feature_name: string
    importance_score: number
    description: string
    category: string
  }>
  all_features: Record<string, number>
  clinical_interpretation: {
    overall_assessment: string
    key_findings: string[]
    recommendations: string[]
    risk_level: string
    confidence_level: string
  }
  processing_time: number
  audio_duration: number
  timestamp: string
  file_name?: string
  file_size?: number
  audioData?: {
    blob?: Blob
    url?: string
    duration?: number
    type: 'recorded' | 'uploaded'
  }
}

interface AnalysisStore {
  analysisData: AnalysisData | null
  setAnalysisData: (data: AnalysisData) => void
  clearAnalysisData: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      analysisData: null,
      setAnalysisData: (data) => set({ analysisData: data, error: null }),
      clearAnalysisData: () => set({ analysisData: null, error: null }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({ 
        analysisData: state.analysisData 
      }),
    }
  )
)
