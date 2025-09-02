'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Square, 
  FileAudio, 
  BarChart3,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import VoiceRecorder from '@/components/VoiceRecorder'
import FileUpload from '@/components/FileUpload'
import AudioPlayer from '@/components/AudioPlayer'
import { useAnalysisStore } from '@/store/analysisStore'
import { toast } from 'react-hot-toast'

export default function AnalysisPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [audioData, setAudioData] = useState<{
    blob?: Blob
    url?: string
    duration?: number
    type: 'recorded' | 'uploaded'
  } | null>(null)
  
  const { setAnalysisData } = useAnalysisStore()
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Page entrance animation
    const tl = gsap.timeline()
    tl.fromTo('.page-header', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.tab-container', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 
      '-=0.4'
    )
    .fromTo('.content-area', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
      '-=0.6'
    )

    return () => {
      tl.kill()
    }
  }, [])

  const handleAudioReady = (data: {
    blob: Blob
    url: string
    duration: number
    type: 'recorded' | 'uploaded'
  }) => {
    setAudioData(data)
    toast.success('Audio ready for analysis!')
  }

  const handleAnalysis = async () => {
    if (!audioData?.blob) {
      toast.error('Please record or upload audio first')
      return
    }

    setIsAnalyzing(true)
    
    try {
      let result
      
      if (audioData.type === 'uploaded') {
        // For uploaded files, use the predict endpoint with FormData
        const formData = new FormData()
        formData.append('file', audioData.blob, 'audio.wav')
        
        const response = await fetch('/api/predict', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Analysis failed')
        }

        result = await response.json()
      } else {
        // For recorded audio, use the record endpoint with base64
        const arrayBuffer = await audioData.blob.arrayBuffer()
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        
        const response = await fetch('/api/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio_data: base64,
            duration: audioData.duration || 0,
            sample_rate: 16000
          }),
        })

        if (!response.ok) {
          throw new Error('Analysis failed')
        }

        result = await response.json()
      }
      
      // Store analysis data
      setAnalysisData({
        ...result,
        audioData: audioData,
        timestamp: new Date().toISOString()
      })

      // Navigate to results
      router.push('/results')
      
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const tabs = [
    { id: 'record', label: 'Record Voice', icon: Mic },
    { id: 'upload', label: 'Upload File', icon: Upload }
  ]

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container-custom py-12">
        {/* Page Header */}
        <motion.div className="page-header text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
            ParkIQ Voice Analysis
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Record your voice or upload an audio file to analyze for early signs of Parkinson's disease. 
            Our AI system will examine 35 voice biomarkers to provide accurate results.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div className="tab-container mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-xl p-2 shadow-soft border border-border">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'record' | 'upload')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div className="content-area">
          <div className="max-w-4xl mx-auto">
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'record' ? (
                <motion.div
                  key="record"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="card p-8"
                >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mic className="w-10 h-10 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">
                      Record Your Voice
                    </h2>
                    <p className="text-text-secondary">
                      Speak clearly into your microphone for best results. We recommend saying 
                      the vowel "ah" for 3-5 seconds or reading a short passage.
                    </p>
                  </div>
                  
                  <VoiceRecorder onAudioReady={handleAudioReady} />
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="card p-8"
                >
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-10 h-10 text-secondary-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-text-primary mb-2">
                      Upload Audio File
                    </h2>
                    <p className="text-text-secondary">
                      Upload a WAV file (max 50MB) for analysis. Supported formats: WAV only.
                    </p>
                  </div>
                  
                  <FileUpload onAudioReady={handleAudioReady} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Audio Preview */}
            {audioData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 mt-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center">
                    <FileAudio className="w-5 h-5 mr-2" />
                    Audio Preview
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-secondary">
                      Duration: {audioData.duration?.toFixed(1)}s
                    </span>
                    <span className={`badge ${
                      audioData.type === 'recorded' ? 'badge-primary' : 'badge-secondary'
                    }`}>
                      {audioData.type === 'recorded' ? 'Recorded' : 'Uploaded'}
                    </span>
                  </div>
                </div>
                
                <AudioPlayer audioUrl={audioData.url!} />
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleAnalysis}
                    disabled={isAnalyzing}
                    className="btn-primary text-lg px-8 py-3 hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Analyze Voice
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 mt-8 bg-blue-50 border-blue-200"
            >
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Tips for Best Results
                  </h4>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Speak clearly and at a normal volume</li>
                    <li>• Minimize background noise</li>
                    <li>• Record in a quiet environment</li>
                    <li>• Use a good quality microphone if possible</li>
                    <li>• Avoid recording during illness or voice strain</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Privacy Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6 mt-6 bg-gray-50 border-gray-200"
            >
              <div className="flex items-start space-x-3">
                <Shield className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Privacy & Security
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Your audio data is processed securely and temporarily. We do not store your voice recordings 
                    permanently. All analysis is performed using encrypted connections and follows HIPAA guidelines.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
