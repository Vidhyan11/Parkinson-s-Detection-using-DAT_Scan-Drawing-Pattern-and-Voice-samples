'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  className?: string
}

export default function AudioPlayer({ audioUrl, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(audioUrl)
      
      const audio = audioRef.current
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration)
        setIsLoading(false)
      })
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
      
      audio.addEventListener('play', () => setIsPlaying(true))
      audio.addEventListener('pause', () => setIsPlaying(false))
      
      return () => {
        audio.pause()
        audio.removeEventListener('loadedmetadata', () => {})
        audio.removeEventListener('timeupdate', () => {})
        audio.removeEventListener('ended', () => {})
        audio.removeEventListener('play', () => {})
        audio.removeEventListener('pause', () => {})
      }
    }
  }, [audioUrl])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }, [isPlaying])

  const stop = useCallback(() => {
    if (!audioRef.current) return
    
    audioRef.current.pause()
    audioRef.current.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressWidth = rect.width
    const clickPercent = clickX / progressWidth
    
    const newTime = clickPercent * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [duration])

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !volumeRef.current) return
    
    const rect = volumeRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const volumeWidth = rect.width
    const newVolume = Math.max(0, Math.min(1, clickX / volumeWidth))
    
    setVolume(newVolume)
    audioRef.current.volume = newVolume
    
    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    
    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const volumePercent = isMuted ? 0 : volume * 100

  return (
    <div className={`bg-white rounded-lg border border-border p-4 ${className}`}>
      {/* Audio Controls */}
      <div className="flex items-center space-x-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center shadow-soft hover:shadow-medium transition-all duration-200"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={stop}
          disabled={isLoading}
          className="w-10 h-10 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center shadow-soft hover:shadow-medium transition-all duration-200"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
        
        <div className="flex-1">
          <div className="text-sm text-text-secondary mb-1">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
        
        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          <div
            ref={volumeRef}
            onClick={handleVolumeChange}
            className="w-20 h-2 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
          >
            <motion.div
              className="h-full bg-gray-500 rounded-full"
              style={{ width: `${volumePercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>

      {/* Audio Info */}
      <div className="flex items-center justify-between text-sm text-text-secondary">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          <span>Audio Player</span>
        </div>
        
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading...</span>
          </div>
        )}
      </div>

      {/* Waveform Placeholder */}
      <div className="mt-4 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
          <p className="text-xs">Audio Waveform</p>
        </div>
      </div>
    </div>
  )
}
