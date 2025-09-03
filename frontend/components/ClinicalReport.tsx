'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Brain,
  Mic,
  PenTool,
  TrendingUp,
  Shield,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import { LateFusionResponse, PatientInfo } from '@/store/analysisStore'

interface ClinicalReportProps {
  results: LateFusionResponse
  patientInfo?: PatientInfo | null
}

export default function ClinicalReport({ results, patientInfo }: ClinicalReportProps) {
  const getRiskLevel = (confidence: number, probability: number) => {
    if (confidence < 0.5) return { level: 'Uncertain', color: 'text-yellow-600 bg-yellow-100' }
    if (probability > 0.7) return { level: 'High', color: 'text-red-600 bg-red-100' }
    if (probability > 0.5) return { level: 'Moderate', color: 'text-orange-600 bg-orange-100' }
    return { level: 'Low', color: 'text-green-600 bg-green-100' }
  }

  const getUrgencyLevel = (confidence: number, probability: number) => {
    if (confidence < 0.5) return 'Low - Requires follow-up testing'
    if (probability > 0.7) return 'High - Immediate evaluation recommended'
    if (probability > 0.5) return 'Moderate - Schedule evaluation within 2 weeks'
    return 'Low - Routine monitoring recommended'
  }

  const riskInfo = getRiskLevel(results.fusion_confidence, results.fusion_probability_pd)
  const urgencyLevel = getUrgencyLevel(results.fusion_confidence, results.fusion_probability_pd)

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Clinical Report
        </h2>
        <p className="text-gray-600">
          Comprehensive medical interpretation and recommendations
        </p>
      </motion.div>

      {/* Report Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Report Date:</span>
                <span className="font-medium text-gray-900">{formatDate()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analysis ID:</span>
                <span className="font-medium text-gray-900">
                  {Date.now().toString(36).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Processing Time:</span>
                <span className="font-medium text-gray-900">
                  {results.total_processing_time.toFixed(1)}s
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Models Used:</span>
                <span className="font-medium text-gray-900">
                  {results.models_used.length} of 3
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
            {patientInfo ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Patient ID:</span>
                  <span className="font-medium text-gray-900">
                    {patientInfo.patientId || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium text-gray-900">
                    {patientInfo.age || 'Not provided'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium text-gray-900">
                    {patientInfo.gender || 'Not provided'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No patient information provided</p>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Executive Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {results.fusion_prediction_label}
            </div>
            <div className="text-sm text-blue-800">Final Prediction</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {(results.fusion_confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-purple-800">Confidence Level</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {riskInfo.level}
            </div>
            <div className="text-sm text-green-800">Risk Level</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Clinical Assessment</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {results.clinical_summary}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Urgency Level</h4>
              <p className="text-gray-700 text-sm">{urgencyLevel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Model Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Model Analysis</h3>
        
        <div className="space-y-4">
          {Object.entries(results.individual_results).map(([modelType, result]) => {
            if (!result) return null
            
            return (
              <div key={modelType} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {modelType === 'voice' && <Mic className="w-5 h-5 text-blue-600" />}
                    {modelType === 'datscan' && <Brain className="w-5 h-5 text-purple-600" />}
                    {modelType === 'spiral' && <PenTool className="w-5 h-5 text-green-600" />}
                    <h4 className="font-medium text-gray-900 capitalize">
                      {modelType} Analysis
                    </h4>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.prediction === 1 
                      ? 'text-red-600 bg-red-100 border border-red-200' 
                      : 'text-green-600 bg-green-100 border border-green-200'
                  }`}>
                    {result.prediction_label}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {(result.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-600">Confidence</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {(result.probability_pd * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">PD Probability</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {result.processing_time.toFixed(1)}s
                    </div>
                    <div className="text-xs text-gray-600">Processing Time</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">Key Features</h5>
                  <div className="space-y-1">
                    {result.key_features?.slice(0, 3).map((feature, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        <span className="font-medium">{feature.feature_name.replace(/_/g, ' ')}:</span>
                        <span className="text-gray-600 ml-1">{feature.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Clinical Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Clinical Recommendations
        </h3>
        
        <div className="space-y-4">
          {results.recommendations.map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
            >
              <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-blue-800">{recommendation}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Important Note</h4>
              <p className="text-yellow-800 text-sm">
                This analysis is designed as a screening tool and should not replace professional medical diagnosis. 
                All results should be discussed with qualified healthcare providers for proper medical interpretation 
                and follow-up decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Follow-up Schedule */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Follow-up Schedule</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Immediate Actions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Review results with healthcare provider</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Schedule comprehensive evaluation if indicated</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Document findings in patient record</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Monitoring Schedule</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>High Risk: Weekly monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Moderate Risk: Monthly monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Low Risk: 6-month follow-up</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
