'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  FileImage,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface DATScanUploadSectionProps {
  onImageUpload: (file: File) => void
  onRemove: () => void
  currentFile?: File | null
  isAnalyzing?: boolean
}

export default function DATScanUploadSection({ 
  onImageUpload, 
  onRemove, 
  currentFile,
  isAnalyzing = false
}: DATScanUploadSectionProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      handleFileSelect(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.dcm', '.nii'],
      'application/dicom': ['.dcm'],
      'application/octet-stream': ['.nii']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: isAnalyzing
  })

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB')
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    
    // Call parent handler
    onImageUpload(file)
  }

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setZoom(1)
    setRotation(0)
    onRemove()
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  const supportedFormats = ['.dcm', '.nii', '.jpg', '.png', '.jpeg']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ImageIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">DATScan Image Upload</h3>
          <p className="text-sm text-gray-600">
            Upload brain scan images for dopamine transporter analysis
          </p>
        </div>
      </div>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragActive || dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gray-100 rounded-full">
                <Upload className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your image here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports {supportedFormats.join(', ')} files up to 100MB
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
              {supportedFormats.map(format => (
                <span key={format} className="px-2 py-1 bg-gray-100 rounded">
                  {format}
                </span>
              ))}
            </div>

            {isAnalyzing && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Analyzing image...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Image Preview */
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileImage className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {currentFile?.name || 'Image Preview'}
                </span>
                {currentFile && (
                  <span className="text-sm text-gray-500">
                    ({(currentFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                )}
              </div>
              
              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5 || isAnalyzing}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3 || isAnalyzing}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Image Display */}
            <div className="relative overflow-hidden bg-gray-100 rounded-lg">
              <div className="flex justify-center items-center min-h-[300px]">
                <img
                  src={previewUrl}
                  alt="DATScan Preview"
                  className="max-w-full max-h-[400px] object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`
                  }}
                />
              </div>
            </div>

            {/* Status */}
            {isAnalyzing && (
              <div className="mt-4 flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Analyzing DATScan image...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <AlertCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">DATScan Analysis Information</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Analyzes dopamine transporter activity in the brain</li>
              <li>• Supports DICOM (.dcm), NIfTI (.nii), and standard image formats</li>
              <li>• Provides detailed clinical interpretation and confidence scores</li>
              <li>• Weight: 40% in final fusion decision</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
