'use client'

import { motion } from 'framer-motion'
import { 
  Mic, 
  Brain, 
  PenTool, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2
} from 'lucide-react'

interface AnalysisProgressProps {
  progress: {
    voice: number
    datscan: number
    spiral: number
    overall: number
  }
  modelsUsed: string[]
  isComplete: boolean
  totalTime: number
  errors?: string[] | null
}

export default function AnalysisProgress({ 
  progress, 
  modelsUsed, 
  isComplete, 
  totalTime,
  errors
}: AnalysisProgressProps) {
  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'voice':
        return <Mic className="w-5 h-5" />
      case 'datscan':
        return <Brain className="w-5 h-5" />
      case 'spiral':
        return <PenTool className="w-5 h-5" />
      default:
        return <Loader2 className="w-5 h-5" />
    }
  }

  const getModelName = (modelType: string) => {
    switch (modelType) {
      case 'voice':
        return 'Voice Analysis'
      case 'datscan':
        return 'DATScan Analysis'
      case 'spiral':
        return 'Spiral Analysis'
      default:
        return modelType
    }
  }

  const getModelColor = (modelType: string) => {
    switch (modelType) {
      case 'voice':
        return 'text-blue-600 bg-blue-100'
      case 'datscan':
        return 'text-purple-600 bg-purple-100'
      case 'spiral':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (modelType: string) => {
    switch (modelType) {
      case 'voice':
        return 'bg-blue-500'
      case 'datscan':
        return 'bg-purple-500'
      case 'spiral':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <Loader2 className={`w-8 h-8 text-blue-600 ${isComplete ? 'hidden' : 'animate-spin'}`} />
            {isComplete && <CheckCircle className="w-8 h-8 text-green-600" />}
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {isComplete ? 'Analysis Complete!' : 'Analyzing Data...'}
        </h2>
        <p className="text-gray-600">
          {isComplete 
            ? `Analysis completed in ${formatTime(totalTime)}`
            : 'Processing your data with our AI models'
          }
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Overall Progress</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress.overall}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">{progress.overall}%</span>
          </div>
        </div>
      </div>

      {/* Individual Model Progress */}
      <div className="space-y-4">
        {modelsUsed.map((modelType) => (
          <motion.div
            key={modelType}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: modelsUsed.indexOf(modelType) * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${getModelColor(modelType)}`}>
                {getModelIcon(modelType)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">
                  {getModelName(modelType)}
                </h4>
                <p className="text-sm text-gray-600">
                  {progress[modelType as keyof typeof progress] === 100 
                    ? 'Complete' 
                    : 'Processing...'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {progress[modelType as keyof typeof progress] === 100 ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                <span className="text-sm font-medium text-gray-900">
                  {progress[modelType as keyof typeof progress]}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(modelType)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress[modelType as keyof typeof progress]}%` }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Errors Display */}
      {errors && errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-1 bg-red-100 rounded">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-sm text-red-800">
              <p className="font-medium mb-2">Analysis Errors</p>
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-700">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
        >
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Analysis Successfully Completed!
          </h3>
          <p className="text-green-700">
            All selected models have been processed. You can now view your comprehensive results.
          </p>
        </motion.div>
      )}

      {/* Processing Tips */}
      {!isComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Processing Information</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Voice analysis typically takes 15-30 seconds</li>
                <li>• DATScan analysis takes 20-40 seconds</li>
                <li>• Spiral analysis takes 10-20 seconds</li>
                <li>• Late fusion combines all results for final decision</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
