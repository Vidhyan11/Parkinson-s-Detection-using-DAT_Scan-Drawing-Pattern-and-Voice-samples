'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Pause, RotateCcw, Upload, FileAudio, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface VoiceRecorderProps {
  onAudioReady: (data: {
    blob: Blob
    url: string
    duration: number
    type: 'recorded' | 'uploaded'
  }) => void
}

export default function VoiceRecorder({ onAudioReady }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize audio context for visualization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
    }
  }, [])

  // Cleanup function
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      })
      
      streamRef.current = stream
      audioChunksRef.current = []
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)
        setHasRecording(true)
        setUploadedFile(null) // Clear uploaded file when recording
        setError(null)
        
        // Convert to WAV format (simplified - in production use proper conversion)
        convertToWav(audioBlob)
      }
      
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
      // Start visualization
      startVisualization()
      
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast.error('Failed to access microphone. Please check permissions.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording, isPaused])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      
      // Restart timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }, [isRecording, isPaused])

  const startVisualization = useCallback(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const draw = () => {
      if (!isRecording) return
      
      // Create a simple waveform visualization
      const bars = 50
      const barWidth = canvas.width / bars
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#3b82f6'
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * 60 + 20
        const x = i * barWidth
        const y = (canvas.height - height) / 2
        
        ctx.fillRect(x, y, barWidth - 2, height)
      }
      
      animationFrameRef.current = requestAnimationFrame(draw)
    }
    
    draw()
  }, [isRecording])

  const convertToWav = useCallback((blob: Blob) => {
    // In a real implementation, you would convert the audio to WAV format
    // For now, we'll use the original blob
    const wavBlob = new Blob([blob], { type: 'audio/wav' })
    setAudioBlob(wavBlob)
  }, [])

  const playAudio = useCallback(() => {
    if (!audioRef.current || !audioUrl) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.src = audioUrl
      audioRef.current.play()
      setIsPlaying(true)
      
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [audioUrl, isPlaying])

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setAudioUrl(null)
    setHasRecording(false)
    setRecordingTime(0)
    setError(null)
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsProcessing(true)

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith('.wav') && !file.name.toLowerCase().endsWith('.mp3')) {
        throw new Error('Only WAV and MP3 files are supported')
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB
        throw new Error('File size must be less than 50MB')
      }

      // Validate audio file
      const isValidAudio = await validateAudioFile(file)
      if (!isValidAudio) {
        throw new Error('Invalid audio file. Please ensure it\'s a valid audio file.')
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
      setHasRecording(false) // Clear recording when file is uploaded
      setAudioBlob(null)
      setAudioUrl(null)
      setError(null)
      
      toast.success('Audio file uploaded successfully!')

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

  const removeUploadedFile = useCallback(() => {
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (uploadedFile) {
      // File already processed in handleFileUpload
      return
    }
    
    if (audioBlob && hasRecording) {
      onAudioReady({
        blob: audioBlob,
        url: audioUrl!,
        duration: recordingTime,
        type: 'recorded'
      })
    }
  }, [uploadedFile, audioBlob, hasRecording, audioUrl, recordingTime, onAudioReady])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

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
          <Mic className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Voice Analysis</h3>
          <p className="text-sm text-gray-600">
            Record your voice or upload an audio file for analysis
          </p>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <label className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Audio File
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/wav,audio/mp3"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
          </label>
          
          {uploadedFile && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <FileAudio className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">{uploadedFile.name}</span>
              <button
                onClick={removeUploadedFile}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Processing audio file...</span>
          </div>
        )}
      </div>

      {/* Recording Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-2">Or record your voice directly</p>
          
          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-notowed flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                Start Recording
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                )}
                
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            )}
          </div>

          {/* Recording Timer */}
          {isRecording && (
            <div className="mt-3">
              <div className="text-2xl font-mono text-red-600">
                {formatTime(recordingTime)}
              </div>
              <div className="text-sm text-gray-500">
                {isPaused ? 'Paused' : 'Recording...'}
              </div>
            </div>
          )}
        </div>

        {/* Audio Visualization */}
        {isRecording && (
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="border border-gray-300 rounded-lg"
            />
          </div>
        )}

        {/* Audio Playback Controls */}
        {(hasRecording || uploadedFile) && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={playAudio}
              disabled={!audioUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={stopAudio}
              disabled={!audioUrl}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
            
            <button
              onClick={resetRecording}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      {(hasRecording || uploadedFile) && (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            Submit Audio for Analysis
          </button>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <Mic className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Voice Analysis Information</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Analyzes 35 acoustic biomarkers including pitch, jitter, and shimmer</li>
              <li>• Optimal recording time: 10-30 seconds of sustained vowel sound</li>
              <li>• Supported formats: WAV, MP3 (max 50MB)</li>
              <li>• Weight: 20% in final fusion decision</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
