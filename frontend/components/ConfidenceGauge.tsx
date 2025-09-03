'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface ConfidenceGaugeProps {
  value: number // 0-100
  label: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  showLabel?: boolean
}

export default function ConfidenceGauge({ 
  value, 
  label, 
  color = '#2563eb',
  size = 'md',
  showValue = true,
  showLabel = true
}: ConfidenceGaugeProps) {
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return { width: 80, height: 80, strokeWidth: 6, fontSize: 'text-sm' }
      case 'lg':
        return { width: 120, height: 120, strokeWidth: 8, fontSize: 'text-lg' }
      default:
        return { width: 100, height: 100, strokeWidth: 7, fontSize: 'text-base' }
    }
  }, [size])

  const { width, height, strokeWidth, fontSize } = sizeConfig
  const radius = (width - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(Math.max(value, 0), 100) / 100
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress * circumference)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#10b981' // Green
    if (confidence >= 60) return '#f59e0b' // Orange
    if (confidence >= 40) return '#f97316' // Orange-500
    return '#ef4444' // Red
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Moderate'
    if (confidence >= 40) return 'Low'
    return 'Very Low'
  }

  const gaugeColor = color || getConfidenceColor(value)

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Gauge SVG */}
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={width / 2}
            cy={height / 2}
            r={radius}
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`font-bold ${fontSize} text-gray-900`}
            >
              {value.toFixed(0)}%
            </motion.div>
          )}
          
          {showLabel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xs text-gray-600 text-center px-2"
            >
              {getConfidenceLabel(value)}
            </motion.div>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <div className="font-medium text-gray-900 text-sm">{label}</div>
          <div className="text-xs text-gray-500">
            Confidence Level
          </div>
        </motion.div>
      )}

      {/* Confidence indicator */}
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: gaugeColor }}
        />
        <span className="text-xs text-gray-600">
          {getConfidenceLabel(value)} Confidence
        </span>
      </div>
    </div>
  )
}

// Specialized confidence gauge for fusion results
export function FusionConfidenceGauge({ value }: { value: number }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Overall Confidence
        </h3>
        <p className="text-sm text-gray-600">
          Late Fusion Decision Confidence
        </p>
      </div>
      
      <div className="flex justify-center">
        <ConfidenceGauge
          value={value}
          label="Fusion Confidence"
          color="#2563eb"
          size="lg"
          showValue={true}
          showLabel={false}
        />
      </div>
      
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          Late Fusion System
        </div>
      </div>
    </div>
  )
}

// Specialized confidence gauge for individual models
export function ModelConfidenceGauge({ 
  modelType, 
  confidence, 
  prediction 
}: { 
  modelType: string
  confidence: number
  prediction: number
}) {
  const getModelColor = (type: string) => {
    switch (type) {
      case 'voice':
        return '#3b82f6' // Blue
      case 'datscan':
        return '#8b5cf6' // Purple
      case 'spiral':
        return '#10b981' // Green
      default:
        return '#6b7280' // Gray
    }
  }

  const getModelName = (type: string) => {
    switch (type) {
      case 'voice':
        return 'Voice Analysis'
      case 'datscan':
        return 'DATScan Analysis'
      case 'spiral':
        return 'Spiral Analysis'
      default:
        return type
    }
  }

  const getPredictionLabel = (pred: number) => {
    return pred === 1 ? "Parkinson's" : "Healthy"
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-center mb-3">
        <h4 className="font-medium text-gray-900 text-sm">
          {getModelName(modelType)}
        </h4>
        <p className="text-xs text-gray-500">
          {getPredictionLabel(prediction)}
        </p>
      </div>
      
      <div className="flex justify-center mb-3">
        <ConfidenceGauge
          value={confidence * 100}
          label=""
          color={getModelColor(modelType)}
          size="sm"
          showValue={true}
          showLabel={false}
        />
      </div>
      
      <div className="text-center">
        <div className="text-xs text-gray-600">
          Confidence: {(confidence * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  )
}
