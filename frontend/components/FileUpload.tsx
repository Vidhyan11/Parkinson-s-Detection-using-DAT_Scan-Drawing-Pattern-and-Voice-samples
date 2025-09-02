'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileAudio, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FileUploadProps {
  onAudioReady: (data: {
    blob: Blob
    url: string
    duration: number
    type: 'uploaded'
  }) => void
}

export default function FileUpload({ onAudioReady }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setError(null)
    setIsProcessing(true)

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith('.wav')) {
        throw new Error('Only WAV files are supported')
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB
        throw new Error('File size must be less than 50MB')
      }

      // Validate audio file
      const isValidAudio = await validateAudioFile(file)
      if (!isValidAudio) {
        throw new Error('Invalid audio file. Please ensure it\'s a valid WAV file.')
      }

      // Get audio duration
      const duration = await getAudioDuration(file)
      if (duration < 0.5) {
        throw new Error('Audio duration must be at least 0.5 seconds')
      }
      if (duration > 60) {
        throw new Error('Audio duration must be less than 60 seconds')
      }

      setUploadedFile(file)
      toast.success('File uploaded successfully!')

      // Convert to blob and create URL
      const blob = new Blob([file], { type: 'audio/wav' })
      const url = URL.createObjectURL(blob)

      onAudioReady({
        blob,
        url,
        duration,
        type: 'uploaded'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process file'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [onAudioReady])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'audio/wav': ['.wav'],
      'audio/wave': ['.wave']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const removeFile = useCallback(() => {
    setUploadedFile(null)
    setError(null)
  }, [])

  const validateAudioFile = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      audio.oncanplay = () => {
        URL.revokeObjectURL(url)
        resolve(true)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(false)
      }
      
      audio.src = url
    })
  }

  const getAudioDuration = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        resolve(audio.duration)
      }
      
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(0)
      }
      
      audio.src = url
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'border-primary-400 bg-primary-50'
            : isDragReject
            ? 'border-danger-400 bg-danger-50'
            : 'border-gray-300 bg-gray-50 hover:border-primary-300 hover:bg-primary-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {!uploadedFile ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {isDragActive ? 'Drop your audio file here' : 'Upload Audio File'}
                </h3>
                <p className="text-text-secondary">
                  {isDragActive
                    ? 'Release to upload'
                    : 'Drag & drop a WAV file, or click to browse'}
                </p>
              </div>
              
              <div className="text-sm text-text-muted">
                <p>Supported format: WAV only</p>
                <p>Maximum size: 50MB</p>
                <p>Duration: 0.5 - 60 seconds</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-700 mb-2">
                  File Uploaded Successfully!
                </h3>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <FileAudio className="w-8 h-8 text-green-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-text-primary truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile()
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Processing State */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-700 font-medium">Processing audio file...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-danger-50 border border-danger-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-danger-800">Upload Error</h4>
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-text-primary mb-2">Upload Requirements:</h4>
        <ul className="text-sm text-text-secondary space-y-1">
          <li>• File format: WAV (Windows PCM)</li>
          <li>• Audio quality: Mono, 8kHz-48kHz sample rate</li>
          <li>• Duration: 0.5 to 60 seconds</li>
          <li>• File size: Maximum 50MB</li>
          <li>• Content: Clear speech, minimal background noise</li>
        </ul>
      </div>
    </div>
  )
}
