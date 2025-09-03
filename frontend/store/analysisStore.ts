import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IndividualModelResult {
  model_type: string
  prediction: number
  prediction_label: string
  confidence: number
  probability_pd: number
  probability_healthy: number
  key_features: Array<{
    feature_name: string
    importance_score: number
    description: string
    category: string
    value?: number
  }>
  processing_time: number
  clinical_notes: string
}

export interface LateFusionResponse {
  fusion_prediction: number
  fusion_prediction_label: string
  fusion_confidence: number
  fusion_probability_pd: number
  fusion_probability_healthy: number
  individual_results: {
    voice?: IndividualModelResult
    datscan?: IndividualModelResult
    spiral?: IndividualModelResult
  }
  fusion_weights: {
    voice: number
    datscan: number
    spiral: number
  }
  models_used: string[]
  total_processing_time: number
  clinical_summary: string
  recommendations: string[]
  errors?: string[] | null
  timestamp: string
}

export interface PatientInfo {
  patientId?: string
  age?: number
  gender?: "Male" | "Female" | "Other"
  clinicalHistory?: string
  analysisTypes: {
    voice: boolean
    datscan: boolean
    spiral: boolean
  }
}

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
  // Legacy single-model analysis
  analysisData: AnalysisData | null
  setAnalysisData: (data: AnalysisData) => void
  
  // New multimodal analysis
  multimodalResults: LateFusionResponse | null
  setMultimodalResults: (data: LateFusionResponse) => void
  
  // Patient information
  patientInfo: PatientInfo | null
  setPatientInfo: (info: PatientInfo) => void
  
  // Analysis state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  
  // Analysis progress
  analysisProgress: {
    voice: number
    datscan: number
    spiral: number
    overall: number
  }
  setAnalysisProgress: (progress: Partial<AnalysisStore['analysisProgress']>) => void
  
  // Clear all data
  clearAnalysisData: () => void
  clearMultimodalResults: () => void
  clearAll: () => void
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      // Legacy single-model analysis
      analysisData: null,
      setAnalysisData: (data) => set({ analysisData: data, error: null }),
      
      // New multimodal analysis
      multimodalResults: null,
      setMultimodalResults: (data) => set({ multimodalResults: data, error: null }),
      
      // Patient information
      patientInfo: null,
      setPatientInfo: (info) => set({ patientInfo: info }),
      
      // Analysis state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
      
      // Analysis progress
      analysisProgress: {
        voice: 0,
        datscan: 0,
        spiral: 0,
        overall: 0
      },
      setAnalysisProgress: (progress) => set((state) => ({
        analysisProgress: { ...state.analysisProgress, ...progress }
      })),
      
      // Clear functions
      clearAnalysisData: () => set({ analysisData: null, error: null }),
      clearMultimodalResults: () => set({ multimodalResults: null, error: null }),
      clearAll: () => set({ 
        analysisData: null, 
        multimodalResults: null, 
        patientInfo: null,
        error: null,
        analysisProgress: { voice: 0, datscan: 0, spiral: 0, overall: 0 }
      }),
    }),
    {
      name: 'analysis-storage',
      partialize: (state) => ({ 
        analysisData: state.analysisData,
        multimodalResults: state.multimodalResults,
        patientInfo: state.patientInfo
      }),
    }
  )
)
