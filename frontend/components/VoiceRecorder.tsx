'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface VoiceRecorderProps {
  onAudioReady: (data: {
    blob: Blob
    url: string
    duration: number
    type: 'recorded'
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()

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
      startVisualization(stream)
      
      toast.success('Recording started')
      
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check microphone permissions.')
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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      toast.success('Recording stopped')
    }
  }, [isRecording])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        toast.success('Recording resumed')
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        toast.success('Recording paused')
      }
    }
  }, [isRecording, isPaused])

  const resetRecording = useCallback(() => {
    setAudioBlob(null)
    setAudioUrl(null)
    setHasRecording(false)
    setRecordingTime(0)
    setIsRecording(false)
    setIsPaused(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [])

  const playRecording = useCallback(() => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsPlaying(true)
        
        audioRef.current.onended = () => setIsPlaying(false)
      }
    }
  }, [audioUrl, isPlaying])

  const convertToWav = async (blob: Blob) => {
    try {
      // In a real implementation, you would convert the audio to WAV format
      // For now, we'll use the original blob but simulate WAV conversion
      const wavBlob = new Blob([blob], { type: 'audio/wav' })
      
      // Calculate duration from the recording time
      const duration = recordingTime
      
      onAudioReady({
        blob: wavBlob,
        url: audioUrl || '',
        duration,
        type: 'recorded'
      })
      
    } catch (error) {
      console.error('Error converting to WAV:', error)
      toast.error('Error processing audio')
    }
  }

  const startVisualization = (stream: MediaStream) => {
    if (!canvasRef.current) return
    
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    
    source.connect(analyser)
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)
      
      analyser.getByteFrequencyData(dataArray)
      
      ctx.fillStyle = 'rgb(248, 250, 252)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, '#0ea5e9')
        gradient.addColorStop(1, '#0284c7')
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        
        x += barWidth + 1
      }
    }
    
    draw()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="flex justify-center space-x-4">
        {!isRecording && !hasRecording && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startRecording}
            className="w-16 h-16 bg-danger-500 hover:bg-danger-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Mic className="w-8 h-8" />
          </motion.button>
        )}
        
        {isRecording && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pauseRecording}
              className="w-12 h-12 bg-warning-500 hover:bg-warning-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Square className="w-6 h-6" />
            </motion.button>
          </>
        )}
        
        {hasRecording && !isRecording && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playRecording}
              className="w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetRecording}
              className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </div>

      {/* Recording Status */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-danger-500 rounded-full animate-pulse"></div>
              <span className="text-danger-600 font-medium">
                {isPaused ? 'Recording Paused' : 'Recording...'}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-text-primary">
              {formatTime(recordingTime)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waveform Visualization */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full h-24 bg-gray-100 rounded-lg border border-border mx-auto"
        />
        {!isRecording && !hasRecording && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mic className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Click record to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-text-secondary">
        <p className="mb-2">
          <strong>Tip:</strong> Speak clearly and maintain a steady volume
        </p>
        <p>
          Recommended: Say "ah" for 3-5 seconds or read a short passage
        </p>
      </div>

      {/* Recording Complete */}
      <AnimatePresence>
        {hasRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-medium">Recording Complete!</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Your voice sample is ready for analysis
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
