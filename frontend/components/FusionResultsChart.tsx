'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Brain, 
  Mic, 
  PenTool,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { LateFusionResponse } from '@/store/analysisStore'

interface FusionResultsChartProps {
  results: LateFusionResponse
}

export default function FusionResultsChart({ results }: FusionResultsChartProps) {
  const chartData = useMemo(() => {
    const { individual_results, fusion_weights } = results
    
    return Object.entries(fusion_weights).map(([model, weight]) => {
      const result = individual_results[model as keyof typeof individual_results]
      return {
        model,
        weight: weight * 100,
        confidence: result?.confidence || 0,
        probability_pd: result?.probability_pd || 0,
        prediction: result?.prediction || 0,
        processing_time: result?.processing_time || 0
      }
    }).filter(item => item.weight > 0)
  }, [results])

  const getModelIcon = (modelType: string) => {
    switch (modelType) {
      case 'voice':
        return <Mic className="w-4 h-4" />
      case 'datscan':
        return <Brain className="w-4 h-4" />
      case 'spiral':
        return <PenTool className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
  }

  const getModelColor = (modelType: string) => {
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

  const getPredictionColor = (prediction: number) => {
    return prediction === 1 
      ? 'text-red-600 bg-red-100 border-red-200' 
      : 'text-green-600 bg-green-100 border-green-200'
  }

  const getPredictionIcon = (prediction: number) => {
    return prediction === 1 
      ? <AlertTriangle className="w-4 h-4" />
      : <CheckCircle className="w-4 h-4" />
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
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Late Fusion Analysis
        </h2>
        <p className="text-gray-600">
          Multi-modal decision fusion using weighted confidence adjustment
        </p>
      </div>

      {/* Model Weights Visualization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          Model Contribution Weights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {chartData.map((item, index) => (
            <motion.div
              key={item.model}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center space-y-3"
            >
              {/* Model Icon and Name */}
              <div className="flex justify-center">
                <div className={`p-3 rounded-full ${getModelColor(item.model)}`}>
                  {getModelIcon(item.model)}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">{getModelName(item.model)}</h4>
                <p className="text-sm text-gray-600">Base Weight</p>
              </div>
              
              {/* Weight Bar */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className={`h-3 rounded-full ${getModelColor(item.model)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.weight}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {item.weight.toFixed(0)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fusion Decision Process */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Fusion Decision Process
        </h3>
        
        <div className="space-y-4">
          {/* Step 1: Individual Model Results */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Step 1: Individual Model Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {chartData.map((item, index) => (
                <motion.div
                  key={item.model}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${getModelColor(item.model)}`}>
                      {getModelIcon(item.model)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {getModelName(item.model)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prediction:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPredictionColor(item.prediction)}`}>
                        <div className="flex items-center gap-1">
                          {getPredictionIcon(item.prediction)}
                          {item.prediction === 1 ? "PD" : "Healthy"}
                        </div>
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium text-gray-900">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-900">
                        {formatTime(item.processing_time)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Step 2: Weighted Fusion */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Step 2: Confidence-Adjusted Weighting</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Base weights are adjusted by individual model confidence</p>
              <p>• Higher confidence models have greater influence on final decision</p>
              <p>• Final weights: {chartData.map(item => 
                `${getModelName(item.model)} (${(item.weight * item.confidence).toFixed(1)}%)`
              ).join(', ')}</p>
            </div>
          </div>

          {/* Step 3: Final Decision */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Step 3: Late Fusion Decision</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-green-800 space-y-1">
                  <p>• Combined probability threshold: 50%</p>
                  <p>• Final prediction: <strong>{results.fusion_prediction_label}</strong></p>
                  <p>• Overall confidence: <strong>{(results.fusion_confidence * 100).toFixed(1)}%</strong></p>
                </div>
              </div>
              
              <div className="text-center">
                <div className={`px-4 py-2 rounded-lg text-lg font-bold ${getPredictionColor(results.fusion_prediction)}`}>
                  {results.fusion_prediction_label}
                </div>
                <div className="text-sm text-green-700 mt-1">
                  {(results.fusion_confidence * 100).toFixed(0)}% Confidence
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Processing Time:</span>
              <span className="font-medium text-gray-900">
                {formatTime(results.total_processing_time)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Models Used:</span>
              <span className="font-medium text-gray-900">
                {results.models_used.length} of 3
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fusion Method:</span>
              <span className="font-medium text-gray-900">
                Weighted Average + Confidence Adjustment
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Parkinson's Probability:</span>
              <span className="font-medium text-gray-900">
                {(results.fusion_probability_pd * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Healthy Probability:</span>
              <span className="font-medium text-gray-900">
                {(results.fusion_probability_healthy * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Decision Threshold:</span>
              <span className="font-medium text-gray-900">
                >50% = Parkinson's Disease
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
