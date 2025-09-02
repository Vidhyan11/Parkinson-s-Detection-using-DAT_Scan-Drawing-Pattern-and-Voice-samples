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
  CheckCircle
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
      title: '35 Voice Biomarkers',
      description: 'Comprehensive analysis of pitch, jitter, shimmer, formants, and spectral features'
    },
    {
      icon: Zap,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms trained on extensive clinical datasets'
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

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Early Detection',
      description: 'Identify subtle voice changes before visible symptoms appear'
    },
    {
      icon: Users,
      title: 'Patient Monitoring',
      description: 'Track progression and treatment effectiveness over time'
    },
    {
      icon: Award,
      title: 'Clinical Validation',
      description: 'Peer-reviewed research and clinical trial validation'
    },
    {
      icon: CheckCircle,
      title: 'Easy Integration',
      description: 'Seamlessly integrate with existing healthcare workflows'
    }
  ]

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">ParkIQ</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Benefits</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </div>
            <Link 
              href="/analysis"
              className="btn-primary px-6 py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container-custom">
          <div className="text-center max-w-5xl mx-auto">
            <motion.h1 
              className="hero-title text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight"
            >
              Advanced Voice Analysis for
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Parkinson's Detection
              </span>
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              ParkIQ leverages cutting-edge AI technology to analyze 35 voice biomarkers, 
              providing clinicians with early detection capabilities and comprehensive patient insights.
            </motion.p>

            <motion.div className="hero-cta mb-16">
              <Link 
                href="/analysis"
                className="btn-primary text-lg px-8 py-4 mr-4 mb-4 md:mb-0"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Analysis
              </Link>
              <Link 
                href="/about"
                className="btn-outline text-lg px-8 py-4"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Hero Stats */}
            <motion.div className="hero-stats grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">35+</div>
                <div className="text-gray-600">Voice Biomarkers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
                <div className="text-gray-600">Security</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">&lt;30s</div>
                <div className="text-gray-600">Analysis Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">HIPAA</div>
                <div className="text-gray-600">Compliant</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Advanced Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ParkIQ combines cutting-edge AI with clinical expertise to deliver 
              the most comprehensive voice analysis platform available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Clinical Benefits
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your practice with evidence-based voice analysis 
              that enhances patient care and clinical decision-making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Patient Care?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join leading healthcare providers who are already using ParkIQ 
            to enhance their diagnostic capabilities and patient outcomes.
          </p>
          <Link 
            href="/analysis"
            className="btn-white text-lg px-8 py-4"
          >
            <Activity className="w-5 h-5 mr-2" />
            Start Free Analysis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-custom">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">ParkIQ</span>
            </div>
            <p className="text-gray-400 mb-6">
              Advanced AI-powered voice analysis for Parkinson's disease detection
            </p>
            <div className="text-sm text-gray-500">
              © 2024 ParkIQ. All rights reserved. | HIPAA Compliant | Clinical Grade
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
