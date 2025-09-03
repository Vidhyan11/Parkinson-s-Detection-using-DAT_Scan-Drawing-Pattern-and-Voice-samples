'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  User, 
  Calendar, 
  VenusMars, 
  FileText, 
  Mic, 
  Brain, 
  PenTool,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { PatientInfo } from '@/store/analysisStore'

interface PatientInfoFormProps {
  onComplete: (data: PatientInfo) => void
  initialData?: PatientInfo
}

export default function PatientInfoForm({ onComplete, initialData }: PatientInfoFormProps) {
  const [selectedTypes, setSelectedTypes] = useState<PatientInfo['analysisTypes']>(
    initialData?.analysisTypes || {
      voice: true,
      datscan: false,
      spiral: false
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<PatientInfo>({
    defaultValues: initialData || {
      analysisTypes: selectedTypes
    },
    mode: 'onChange'
  })

  const watchedAge = watch('age')
  const watchedGender = watch('gender')

  const handleAnalysisTypeChange = (type: keyof PatientInfo['analysisTypes']) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const onSubmit = (data: PatientInfo) => {
    const completeData: PatientInfo = {
      ...data,
      analysisTypes: selectedTypes
    }
    onComplete(completeData)
  }

  const hasSelectedTypes = Object.values(selectedTypes).some(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-3 bg-blue-100 rounded-full">
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Patient Information
        </h2>
        <p className="text-gray-600">
          Please provide basic patient information and select the types of analysis you'd like to perform.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID (Optional)
              </label>
              <input
                type="text"
                {...register('patientId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter patient ID"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register('age', { 
                  required: 'Age is required',
                  min: { value: 1, message: 'Age must be at least 1' },
                  max: { value: 120, message: 'Age must be less than 120' }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.age ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter age"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.age.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {['Male', 'Female', 'Other'].map((gender) => (
                <label key={gender} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={gender}
                    {...register('gender', { required: 'Gender is required' })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Clinical History */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinical History (Optional)
            </label>
            <textarea
              {...register('clinicalHistory')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter relevant clinical history, symptoms, or notes..."
            />
          </div>
        </div>

        {/* Analysis Types Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Select Analysis Types
          </h3>
          
          <p className="text-sm text-gray-600">
            Choose which types of analysis you'd like to perform. You can select multiple types for comprehensive assessment.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Voice Analysis */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedTypes.voice
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAnalysisTypeChange('voice')}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedTypes.voice ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Mic className={`w-5 h-5 ${
                    selectedTypes.voice ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Voice Analysis</h4>
                  <p className="text-sm text-gray-600">35 acoustic biomarkers</p>
                </div>
                {selectedTypes.voice && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>

            {/* DATScan Analysis */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedTypes.datscan
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAnalysisTypeChange('datscan')}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedTypes.datscan ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Brain className={`w-5 h-5 ${
                    selectedTypes.datscan ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">DATScan Analysis</h4>
                  <p className="text-sm text-gray-600">Brain imaging analysis</p>
                </div>
                {selectedTypes.datscan && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>

            {/* Spiral Analysis */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedTypes.spiral
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAnalysisTypeChange('spiral')}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  selectedTypes.spiral ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <PenTool className={`w-5 h-5 ${
                    selectedTypes.spiral ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Spiral Analysis</h4>
                  <p className="text-sm text-gray-600">Motor skill assessment</p>
                </div>
                {selectedTypes.spiral && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </div>
          </div>

          {!hasSelectedTypes && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Please select at least one analysis type
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!isValid || !hasSelectedTypes}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              isValid && hasSelectedTypes
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Analysis
          </button>
        </div>
      </form>
    </motion.div>
  )
}
