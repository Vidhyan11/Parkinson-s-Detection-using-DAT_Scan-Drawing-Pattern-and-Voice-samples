'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  PenTool, 
  RotateCcw, 
  Download, 
  Upload, 
  Play, 
  Square,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SpiralDrawingSectionProps {
  onDrawingComplete: (imageData: string, drawingTime: number) => void
  onRemove: () => void
  isAnalyzing?: boolean
}

export default function SpiralDrawingSection({ 
  onDrawingComplete, 
  onRemove,
  isAnalyzing = false
}: SpiralDrawingSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingTime, setDrawingTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [penColor, setPenColor] = useState('#2563eb')
  const [penThickness, setPenThickness] = useState(3)
  const [showTemplate, setShowTemplate] = useState(true)
  const [hasDrawing, setHasDrawing] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)
  const [drawingPath, setDrawingPath] = useState<Array<{x: number, y: number}>>([])

  const canvasSize = { width: 400, height: 400 }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with proper scaling for high DPI displays
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    // Set initial styles
    ctx.strokeStyle = penColor
    ctx.lineWidth = penThickness
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Draw template if enabled
    if (showTemplate) {
      drawTemplate(ctx)
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }
    }
  }, [canvasSize, showTemplate, penColor, penThickness])

  const drawTemplate = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])

    // Draw improved spiral template
    const centerX = canvasSize.width / 2
    const centerY = canvasSize.height / 2
    const maxRadius = Math.min(canvasSize.width, canvasSize.height) / 2 - 30

    ctx.beginPath()
    for (let angle = 0; angle <= 6 * Math.PI; angle += 0.05) {
      const radius = (angle / (6 * Math.PI)) * maxRadius
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      
      if (angle === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.restore()
  }

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isAnalyzing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const coords = getCanvasCoordinates(e)
    
    setIsDrawing(true)
    setHasDrawing(true)
    setDrawingPath([coords])
    
    // Start timer if not already running
    if (!isTimerRunning) {
      setStartTime(Date.now())
      setIsTimerRunning(true)
      const interval = setInterval(() => {
        setDrawingTime(prev => prev + 0.1)
      }, 100)
      setTimerInterval(interval)
    }

    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
    ctx.strokeStyle = penColor
    ctx.lineWidth = penThickness
  }, [isAnalyzing, isTimerRunning, penColor, penThickness])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isAnalyzing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const coords = getCanvasCoordinates(e)
    setDrawingPath(prev => [...prev, coords])

    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }, [isDrawing, isAnalyzing])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawing(false)
    setDrawingTime(0)
    setIsTimerRunning(false)
    setStartTime(null)
    setDrawingPath([])
    
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }

    // Redraw template if enabled
    if (showTemplate) {
      drawTemplate(ctx)
    }
  }

  const completeDrawing = () => {
    if (!hasDrawing || isAnalyzing) return

    const canvas = canvasRef.current
    if (!canvas) return

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setIsTimerRunning(false)

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/png')
    
    // Call parent handler
    onDrawingComplete(imageData, drawingTime)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || isAnalyzing) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
        
        // Calculate aspect ratio to fit image properly
        const imgAspect = img.width / img.height
        const canvasAspect = canvasSize.width / canvasSize.height
        
        let drawWidth, drawHeight, offsetX, offsetY
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas
          drawWidth = canvasSize.width
          drawHeight = canvasSize.width / imgAspect
          offsetX = 0
          offsetY = (canvasSize.height - drawHeight) / 2
        } else {
          // Image is taller than canvas
          drawWidth = canvasSize.height * imgAspect
          drawHeight = canvasSize.height
          offsetX = (canvasSize.width - drawWidth) / 2
          offsetY = 0
        }
        
        // Draw uploaded image
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        
        setHasDrawing(true)
        setDrawingTime(0)
        setDrawingPath([])
        
        toast.success('Image uploaded successfully!')
      }
      
      img.onerror = () => {
        toast.error('Failed to load image. Please try another file.')
      }
      
      img.src = event.target?.result as string
    }
    
    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.')
    }
    
    reader.readAsDataURL(file)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const tenths = Math.floor((time % 1) * 10)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`
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
        <div className="p-2 bg-green-100 rounded-lg">
          <PenTool className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Spiral Drawing Assessment</h3>
          <p className="text-sm text-gray-600">
            Draw a spiral to assess motor control and coordination
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Pen Color */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              disabled={isAnalyzing}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Pen Thickness */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Thickness:</label>
            <input
              type="range"
              min="1"
              max="8"
              value={penThickness}
              onChange={(e) => setPenThickness(Number(e.target.value))}
              disabled={isAnalyzing}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-6">{penThickness}</span>
          </div>

          {/* Template Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Template:</label>
            <input
              type="checkbox"
              checked={showTemplate}
              onChange={(e) => setShowTemplate(e.target.checked)}
              disabled={isAnalyzing}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
          </div>

          {/* Timer Display */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-mono text-gray-700">
              {formatTime(drawingTime)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={clearCanvas}
            disabled={isAnalyzing}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>

          <label className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isAnalyzing}
              className="hidden"
            />
          </label>

          <button
            onClick={completeDrawing}
            disabled={!hasDrawing || isAnalyzing}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Drawing
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-300 rounded-lg cursor-crosshair"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          />
        </div>

        {/* Status */}
        {isAnalyzing && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span>Analyzing spiral drawing...</span>
          </div>
        )}
      </div>

      {/* Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-green-100 rounded">
            <AlertCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Spiral Drawing Assessment Information</p>
            <ul className="space-y-1 text-green-700">
              <li>• Assesses motor control, coordination, and tremor patterns</li>
              <li>• Draw naturally without rushing - optimal time is 20-40 seconds</li>
              <li>• Try to follow the template spiral pattern if enabled</li>
              <li>• Weight: 30% in final fusion decision</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
