'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronDown, 
  ChevronUp, 
  Mic, 
  Brain, 
  PenTool, 
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { IndividualModelResult } from '@/store/analysisStore'
import { ModelConfidenceGauge } from './ConfidenceGauge'

interface ModelPredictionCardProps {
  result: IndividualModelResult
  showFeatures?: boolean
  expandable?: boolean
}

export default function ModelPredictionCard({ 
  result, 
  showFeatures = true,
  expandable = true
}: ModelPredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getModelIcon = (modelType: string) => {
    const type = (modelType || '').toLowerCase()
    switch (type) {
      case 'voice analysis':
        return <Mic className="w-5 h-5" />
      case 'datscan analysis':
        return <Brain className="w-5 h-5" />
      case 'spiral analysis':
        return <PenTool className="w-5 h-5" />
      default:
        return <BarChart3 className="w-5 h-5" />
    }
  }

  const getModelColor = (modelType: string) => {
    const type = (modelType || '').toLowerCase()
    switch (type) {
      case 'voice analysis':
        return 'text-blue-600 bg-blue-100'
      case 'datscan analysis':
        return 'text-purple-600 bg-purple-100'
      case 'spiral analysis':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getPredictionColor = (prediction: number) => {
    return prediction === 1 
      ? 'text-red-600 bg-red-100 border-red-200' 
      : 'text-green-600 bg-green-100 border-green-200'
  }

  const getPredictionIcon = (prediction: number) => {
    return prediction === 1 
      ? <XCircle className="w-5 h-5" />
      : <CheckCircle className="w-5 h-5" />
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  const toggleExpanded = () => {
    if (expandable) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div 
        className={`p-4 cursor-pointer ${expandable ? 'hover:bg-gray-50' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getModelColor(result.model_type)}`}>
              {getModelIcon(result.model_type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{result.model_type}</h3>
              <p className="text-sm text-gray-600">
                Processing time: {formatTime(result.processing_time)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Prediction Badge */}
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPredictionColor(result.prediction)}`}>
              <div className="flex items-center gap-1">
                {getPredictionIcon(result.prediction)}
                {result.prediction_label}
              </div>
            </div>
            
            {/* Expand/Collapse Button */}
            {expandable && (
              <div className="text-gray-400">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-4">
              {/* Confidence and Probabilities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Confidence Gauge */}
                <div className="flex justify-center">
                  <ModelConfidenceGauge
                    modelType={(result.model_type || 'voice analysis').toLowerCase().split(' ')[0]}
                    confidence={result.confidence}
                    prediction={result.prediction}
                  />
                </div>
                
                {/* Probabilities */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Parkinson's Probability</label>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-red-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.probability_pd * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>0%</span>
                        <span>{(result.probability_pd * 100).toFixed(1)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Healthy Probability</label>
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.probability_healthy * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>0%</span>
                        <span>{(result.probability_healthy * 100).toFixed(1)}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Processing Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Processing: {formatTime(result.processing_time)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">Confidence Level</div>
                    <div className="text-gray-600">
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Notes */}
              {result.clinical_notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    Clinical Interpretation
                  </h4>
                  <p className="text-sm text-gray-700">{result.clinical_notes}</p>
                </div>
              )}

              {/* Key Features */}
              {showFeatures && result.key_features && result.key_features.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Key Contributing Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.key_features.slice(0, 6).map((feature, index) => (
                      <motion.div
                        key={feature.feature_name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {feature.feature_name.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(feature.importance_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {feature.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Category:</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {feature.category}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
