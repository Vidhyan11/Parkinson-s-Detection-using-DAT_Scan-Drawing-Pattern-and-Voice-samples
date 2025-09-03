'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  FileText, 
  BarChart3,
  Brain,
  Mic,
  PenTool,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

import { useAnalysisStore } from '@/store/analysisStore'
import { FusionConfidenceGauge } from '@/components/ConfidenceGauge'
import FusionResultsChart from '@/components/FusionResultsChart'
import ModelPredictionCard from '@/components/ModelPredictionCard'
import ClinicalReport from '@/components/ClinicalReport'

type ResultsView = 'overview' | 'fusion' | 'individual' | 'clinical'

export default function ResultsPage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<ResultsView>('overview')
  const { multimodalResults, patientInfo, clearAll } = useAnalysisStore()

  if (!multimodalResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="text-center space-y-4 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft border border-white/20 relative z-10">
          <div className="p-4 bg-yellow-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Results Available</h2>
          <p className="text-gray-600">Please complete an analysis first to view results.</p>
          <button
            onClick={() => router.push('/analysis')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-soft hover:shadow-medium"
          >
            Start Analysis
          </button>
        </div>
      </div>
    )
  }

  const views = [
    { id: 'overview', title: 'Overview', icon: Target },
    { id: 'fusion', title: 'Fusion Analysis', icon: Brain },
    { id: 'individual', title: 'Individual Models', icon: BarChart3 },
    { id: 'clinical', title: 'Clinical Report', icon: FileText }
  ]

  const getPredictionColor = (prediction: number) => {
    return prediction === 1 
      ? 'text-red-600 bg-red-100 border-red-200' 
      : 'text-green-600 bg-green-100 border-green-200'
  }

  const getPredictionIcon = (prediction: number) => {
    return prediction === 1 
      ? <AlertTriangle className="w-5 h-5" />
      : <CheckCircle className="w-5 h-5" />
  }

  const downloadReport = () => {
    // Create a simple text report
    const report = `
ParkIQ Multi-Modal Analysis Report
===================================

Date: ${new Date().toLocaleDateString()}
Patient ID: ${patientInfo?.patientId || 'Not provided'}
Age: ${patientInfo?.age || 'Not provided'}
Gender: ${patientInfo?.gender || 'Not provided'}

FINAL RESULTS:
==============
Prediction: ${multimodalResults.fusion_prediction_label}
Confidence: ${(multimodalResults.fusion_confidence * 100).toFixed(1)}%
Parkinson's Probability: ${(multimodalResults.fusion_probability_pd * 100).toFixed(1)}%
Healthy Probability: ${(multimodalResults.fusion_probability_healthy * 100).toFixed(1)}%

Models Used: ${multimodalResults.models_used.join(', ')}
Processing Time: ${multimodalResults.total_processing_time.toFixed(1)}s

CLINICAL SUMMARY:
=================
${multimodalResults.clinical_summary}

RECOMMENDATIONS:
================
${multimodalResults.recommendations.map(rec => `• ${rec}`).join('\n')}
    `
    
    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `parkiq-analysis-report-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ParkIQ Analysis Results',
        text: `Analysis Results: ${multimodalResults.fusion_prediction_label} (${(multimodalResults.fusion_confidence * 100).toFixed(0)}% confidence)`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Results URL copied to clipboard!')
    }
  }

  const startNewAnalysis = () => {
    clearAll()
    router.push('/analysis')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-20 shadow-soft">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Analysis Results
                </h1>
                <p className="text-gray-600">
                  Multi-modal Parkinson's disease detection results
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadReport}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
                <button
                  onClick={shareResults}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {views.map((view) => {
                  const Icon = view.icon
                  return (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id as ResultsView)}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2
                        ${activeView === view.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-gray-50/80 border border-gray-200/50'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {view.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8">
          {/* Main Results Display */}
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Final Result Banner */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-8 text-center shadow-soft">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Target className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    {multimodalResults.fusion_prediction_label}
                  </h2>
                  
                  <div className="flex justify-center mb-6">
                    <div className={`px-6 py-2 rounded-full text-lg font-medium border ${getPredictionColor(multimodalResults.fusion_prediction)}`}>
                      <div className="flex items-center gap-2">
                        {getPredictionIcon(multimodalResults.fusion_prediction)}
                        Final Prediction
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {(multimodalResults.fusion_confidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Confidence</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {(multimodalResults.fusion_probability_pd * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">PD Probability</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {multimodalResults.models_used?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Models Used</div>
                    </div>
                  </div>
                </div>

                {/* Confidence Gauge */}
                <div className="flex justify-center">
                  <FusionConfidenceGauge 
                    value={(multimodalResults.fusion_confidence || 0) * 100}
                  />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 text-center shadow-soft">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {(multimodalResults.total_processing_time || 0).toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600">Processing Time</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 text-center shadow-soft">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {(multimodalResults.fusion_weights?.voice || 0) * 100}%
                    </div>
                    <div className="text-sm text-gray-600">Voice Weight</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 text-center shadow-soft">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {(multimodalResults.fusion_weights?.datscan || 0) * 100}%
                    </div>
                    <div className="text-sm text-gray-600">DATScan Weight</div>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 text-center shadow-soft">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {(multimodalResults.fusion_weights?.spiral || 0) * 100}%
                    </div>
                    <div className="text-sm text-gray-600">Spiral Weight</div>
                  </div>
                </div>

                {/* Clinical Summary */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg p-6 shadow-soft">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Clinical Summary</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {multimodalResults.clinical_summary || 'No clinical summary available.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setActiveView('fusion')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
                  >
                    <Brain className="w-5 h-5" />
                    View Fusion Analysis
                  </button>
                  <button
                    onClick={() => setActiveView('clinical')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
                  >
                    <FileText className="w-5 h-5" />
                    View Clinical Report
                  </button>
                </div>
              </motion.div>
            )}

            {activeView === 'fusion' && (
              <motion.div
                key="fusion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FusionResultsChart results={multimodalResults} />
              </motion.div>
            )}

            {activeView === 'individual' && (
              <motion.div
                key="individual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Individual Model Results
                  </h2>
                  <p className="text-gray-600">
                    Detailed results from each analysis modality
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.entries(multimodalResults.individual_results).map(([modelType, result]) => {
                    if (!result) return null
                    
                    return (
                      <ModelPredictionCard
                        key={modelType}
                        result={result}
                        showFeatures={true}
                        expandable={true}
                      />
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeView === 'clinical' && (
              <motion.div
                key="clinical"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ClinicalReport 
                  results={multimodalResults}
                  patientInfo={patientInfo}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Navigation */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/analysis')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Analysis
            </button>
            
            <button
              onClick={startNewAnalysis}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-soft hover:shadow-medium"
            >
              <Brain className="w-5 h-5" />
              Start New Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
