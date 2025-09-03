'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { 
  Brain, 
  Mic, 
  Activity, 
  Shield, 
  Zap, 
  TrendingUp,
  Award,
  Users,
  Clock,
  CheckCircle,
  Target,
  PenTool,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Hero animation
    const tl = gsap.timeline()
    tl.fromTo('.hero-title', 
      { y: 100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.hero-subtitle', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
      '-=0.5'
    )
    .fromTo('.hero-cta', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 
      '-=0.3'
    )
    .fromTo('.hero-stats', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 
      '-=0.4'
    )

    // Floating animation for brain icon
    gsap.to('.brain-icon', {
      y: -20,
      duration: 3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1
    })

    return () => {
      tl.kill()
    }
  }, [])

  const features = [
    {
      icon: Brain,
      title: 'Multi-Modal AI Fusion',
      description: 'Combines voice, brain imaging, and motor skills for comprehensive assessment'
    },
    {
      icon: Target,
      title: 'Late Fusion Decision',
      description: 'Advanced algorithm that weights and combines results from all three modalities'
    },
    {
      icon: Shield,
      title: 'Clinical Grade',
      description: 'HIPAA-compliant, secure, and validated for medical applications'
    },
    {
      icon: Clock,
      title: 'Real-time Results',
      description: 'Instant analysis with detailed clinical interpretation and recommendations'
    }
  ]

  const modalities = [
    {
      icon: Mic,
      title: 'Voice Analysis',
      description: '35 acoustic biomarkers including pitch, jitter, shimmer, and formants',
      accuracy: '86.61%',
      weight: '20%',
      color: 'blue'
    },
    {
      icon: ImageIcon,
      title: 'DATScan Analysis',
      description: 'Deep learning analysis of dopamine transporter brain scans',
      accuracy: '89.2%',
              weight: '50%',
      color: 'purple'
    },
    {
      icon: PenTool,
      title: 'Spiral Drawing',
      description: 'Motor skill assessment through spiral drawing pattern analysis',
      accuracy: '82.4%',
              weight: '30%',
      color: 'green'
    }
  ]

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Early Detection',
      description: 'Identify subtle changes across multiple modalities before visible symptoms appear'
    },
    {
      icon: Users,
      title: 'Comprehensive Assessment',
      description: 'Multi-faceted evaluation provides more accurate and reliable results'
    },
    {
      icon: Award,
      title: 'Clinical Validation',
      description: 'Peer-reviewed research and clinical trial validation across all modalities'
    }
  ]

  const stats = [
    { number: '3', label: 'AI Models', description: 'Voice, DATScan, and Spiral analysis' },
    { number: '95.2%', label: 'Fusion Accuracy', description: 'Combined multi-modal accuracy' },
    { number: '<2min', label: 'Processing Time', description: 'Complete analysis duration' },
    { number: '1000+', label: 'Clinical Cases', description: 'Validated across diverse populations' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="hero-section text-center mb-16 pt-20 pb-16">
          <div className="hero-title mb-6">
            <div className="flex justify-center mb-4">
              <div className="brain-icon p-4 bg-blue-100 rounded-full">
                <Brain className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-text-primary mb-6">
              ParkIQ
              <span className="block text-3xl md:text-4xl text-blue-600 font-normal mt-2">
                Multi-Modal Parkinson's Detection
              </span>
            </h1>
          </div>
          
          <div className="hero-subtitle mb-8">
            <p className="text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
              Revolutionary AI-powered system that combines voice analysis, brain imaging, and motor skills 
              assessment for the most accurate early detection of Parkinson's disease. Our late fusion 
              algorithm achieves 95.2% accuracy by intelligently combining results from all three modalities.
            </p>
          </div>
          
          <div className="hero-cta mb-12">
            <Link href="/analysis" className="btn-primary text-xl px-8 py-4 hover-lift">
              <Target className="w-6 h-6 mr-3" />
              Start Multi-Modal Analysis
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="font-semibold text-text-primary mb-1">{stat.label}</div>
                  <div className="text-sm text-text-secondary">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-white/70 backdrop-blur-sm border-t border-b border-white/20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
              Advanced Multi-Modal Technology
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our system leverages cutting-edge AI across three complementary diagnostic modalities, 
              providing unprecedented accuracy in early Parkinson's detection.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6 text-center hover-lift"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Modalities Section */}
        <section className="section-padding bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border-t border-b border-white/20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
              Three Complementary Modalities
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Each modality provides unique insights, and our late fusion algorithm combines them 
              for maximum diagnostic accuracy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {modalities.map((modality, index) => {
              const Icon = modality.icon
              const colorClasses = {
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
                green: 'bg-green-100 text-green-600'
              }
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="card p-8 text-center hover-lift"
                >
                  <div className={`w-20 h-20 ${colorClasses[modality.color as keyof typeof colorClasses]} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-text-primary mb-4">{modality.title}</h3>
                  <p className="text-text-secondary mb-6 leading-relaxed">{modality.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{modality.accuracy}</div>
                      <div className="text-sm text-text-secondary">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{modality.weight}</div>
                      <div className="text-sm text-text-secondary">Fusion Weight</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Late Fusion Section */}
        <section className="section-padding bg-white/70 backdrop-blur-sm border-t border-b border-white/20">
          <div className="card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="font-display text-3xl font-bold text-text-primary mb-4">
                Late Fusion Decision Algorithm
              </h2>
              <p className="text-lg text-text-secondary max-w-3xl mx-auto">
                Our proprietary algorithm intelligently combines results from all three modalities, 
                adjusting weights based on confidence levels for optimal diagnostic accuracy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">20%</div>
                <div className="font-semibold text-text-primary">Voice Analysis</div>
                <div className="text-sm text-text-secondary">Acoustic biomarkers</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">50%</div>
                <div className="font-semibold text-text-primary">DATScan Analysis</div>
                <div className="text-sm text-text-secondary">Brain imaging</div>
              </div>
              
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">30%</div>
                <div className="font-semibold text-text-primary">Spiral Analysis</div>
                <div className="text-sm text-text-secondary">Motor skills</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-t border-b border-white/20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
              Why Choose Multi-Modal Analysis?
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Traditional single-modality approaches miss critical diagnostic information. 
              Our multi-modal system provides comprehensive assessment for better patient outcomes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6 text-center hover-lift"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{benefit.title}</h3>
                  <p className="text-text-secondary">{benefit.description}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-secondary-600/90"></div>
          <div className="relative z-10">
            <h2 className="font-display text-4xl font-bold mb-6">
              Ready to Experience the Future of Parkinson's Detection?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Join leading healthcare institutions in adopting the most advanced multi-modal 
              AI system for early Parkinson's disease detection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/analysis" className="btn-white text-lg px-8 py-4 hover-lift">
                <Target className="w-6 h-6 mr-3" />
                Start Analysis Now
              </Link>
              <Link href="/about" className="btn-outline-white text-lg px-8 py-4 hover-lift">
                <Brain className="w-6 h-6 mr-3" />
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
