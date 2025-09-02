'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  BarChart3, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  FileAudio,
  Brain,
  TrendingUp,
  AlertCircle,
  Mic
} from 'lucide-react'
import { useAnalysisStore } from '@/store/analysisStore'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js'
import { Bar, Radar } from 'react-chartjs-2'
import toast from 'react-hot-toast'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler)

export default function ResultsPage() {
  const router = useRouter()
  const { analysisData, clearAnalysisData } = useAnalysisStore()
  const [isLoading, setIsLoading] = useState(true)
  const [animateConfidence, setAnimateConfidence] = useState(false)
  
  const confidenceRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!analysisData) {
      router.push('/analysis')
      return
    }

    setIsLoading(false)
    
    // Start confidence animation after a short delay
    const timer = setTimeout(() => {
      setAnimateConfidence(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [analysisData, router])

  useEffect(() => {
    if (!animateConfidence || !confidenceRef.current) return

    // Animate confidence meter
    gsap.fromTo(confidenceRef.current, 
      { width: '0%' }, 
      { 
        width: `${(analysisData?.confidence || 0) * 100}%`, 
        duration: 2, 
        ease: 'power2.out',
        onComplete: () => {
          // Animate feature importance bars
          if (featuresRef.current) {
            gsap.fromTo('.feature-bar', 
              { scaleX: 0 }, 
              { 
                scaleX: 1, 
                duration: 0.8, 
                stagger: 0.1, 
                ease: 'power2.out' 
              }
            )
          }
        }
      }
    )
  }, [animateConfidence, analysisData?.confidence])

  if (isLoading || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing voice sample...</p>
        </div>
      </div>
    )
  }

  const isHealthy = analysisData.prediction === 0
  const confidenceColor = analysisData.confidence > 0.8 ? 'blue' : analysisData.confidence > 0.6 ? 'yellow' : 'red'
  const confidenceClass = `confidence-${confidenceColor}`

  // Prepare chart data for top features
  const barChartData = {
    labels: analysisData.top_features.slice(0, 8).map(f => f.feature_name.replace(/_/g, ' ')),
    datasets: [
      {
        label: 'Feature Importance',
        data: analysisData.top_features.slice(0, 8).map(f => f.importance_score),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  }

  // Radar chart for feature categories
  const radarChartData = {
    labels: ['Pitch Analysis', 'Jitter & Shimmer', 'Formant Analysis', 'Spectral Features', 'MFCC Coefficients', 'Voice Quality'],
    datasets: [
      {
        label: 'Feature Values',
        data: [
          analysisData.all_features.pitch_mean || 0,
          analysisData.all_features.jitter_percent || 0,
          analysisData.all_features.formant_f1_mean || 0,
          analysisData.all_features.spectral_centroid_mean || 0,
          analysisData.all_features.mfcc_1 || 0,
          analysisData.all_features.hnr || 0
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Importance: ${(context.parsed.y * 100).toFixed(2)}%`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value: any) {
            return `${(value * 100).toFixed(0)}%`
          }
        }
      }
    }
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          display: false
        }
      }
    }
  }

  const handleNewAnalysis = () => {
    clearAnalysisData()
    router.push('/analysis')
  }

  const handleDownloadReport = () => {
    // In a real implementation, generate and download PDF report
    toast.success('Clinical report download started')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ParkIQ Voice Analysis Results',
        text: `Voice analysis result: ${analysisData.prediction_label} with ${analysisData.confidence_percentage} confidence`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Results link copied to clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container-custom py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.back()}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Analysis</span>
          </button>
          
          <div className="flex space-x-3">
            <button onClick={handleDownloadReport} className="btn-outline flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            <button onClick={handleShare} className="btn-outline flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Share Results</span>
            </button>
          </div>
        </motion.div>

        {/* Main Results */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Prediction Result */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center bg-white shadow-lg border-0"
          >
            <div className="mb-8">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isHealthy ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isHealthy ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-red-600" />
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {analysisData.prediction_label}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6">
                AI-Powered Voice Analysis Complete
              </p>

              {/* Confidence Meter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Confidence Level</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {analysisData.confidence_percentage}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    ref={confidenceRef}
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      confidenceColor === 'blue' ? 'bg-blue-500' : 
                      confidenceColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: '0%' }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>

              {/* Probability Scores */}
              <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {(analysisData.probability_healthy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700 font-medium">Healthy Probability</div>
                </div>
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {(analysisData.probability_pd * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-700 font-medium">Parkinson's Probability</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Clinical Interpretation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 bg-white shadow-lg border-0"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Brain className="w-8 h-8 mr-4 text-blue-600" />
              Clinical Assessment & Interpretation
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Overall Assessment
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {analysisData.clinical_interpretation.overall_assessment}
                </p>
                
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Risk Assessment</h4>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    confidenceColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                    confidenceColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {analysisData.clinical_interpretation.risk_level} Risk
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Key Clinical Findings
                </h3>
                <ul className="space-y-3">
                  {analysisData.clinical_interpretation.key_findings.map((finding, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Clinical Recommendations
              </h3>
              <ul className="space-y-3">
                {analysisData.clinical_interpretation.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Feature Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Importance Chart */}
            <motion.div 
              ref={featuresRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-8 bg-white shadow-lg border-0"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                Top Contributing Features
              </h2>
              
              <div className="h-80">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Radar Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-8 bg-white shadow-lg border-0"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                Voice Feature Profile
              </h2>
              
              <div className="h-80">
                <Radar data={radarChartData} options={radarOptions} />
              </div>
            </motion.div>
          </div>

          {/* Feature Details Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-8 bg-white shadow-lg border-0"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Info className="w-6 h-6 mr-3 text-purple-600" />
              Detailed Feature Analysis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisData.top_features.slice(0, 9).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {feature.feature_name.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-xs font-medium text-blue-600">
                      {(feature.importance_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {feature.category}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full feature-bar"
                        style={{ width: `${feature.importance_score * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Analysis Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-600" />
              Analysis Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analysisData.processing_time.toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600">Processing Time</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileAudio className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analysisData.audio_duration.toFixed(1)}s
                </div>
                <div className="text-sm text-gray-600">Audio Duration</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Object.keys(analysisData.all_features).length}
                </div>
                <div className="text-sm text-gray-600">Features Analyzed</div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="text-center space-y-6"
          >
            <button
              onClick={handleNewAnalysis}
              className="btn-primary text-lg px-8 py-4 hover-lift"
            >
              <Mic className="w-5 h-5 mr-2" />
              Analyze Another Sample
            </button>
            
            <div className="text-sm text-gray-500 max-w-2xl mx-auto">
              <p className="mb-2">
                Analysis performed on {new Date(analysisData.timestamp).toLocaleString()}
              </p>
              <p className="text-xs leading-relaxed">
                <strong>Medical Disclaimer:</strong> This AI-powered analysis is intended to assist healthcare professionals 
                and should not replace clinical judgment or professional medical diagnosis. Always consult with qualified 
                healthcare providers for medical decisions and treatment plans.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
