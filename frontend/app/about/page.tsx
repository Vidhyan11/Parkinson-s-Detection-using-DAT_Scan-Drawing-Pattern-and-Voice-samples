'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { 
  Brain, 
  BarChart3, 
  Shield, 
  Users, 
  TrendingUp, 
  Zap,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  Database
} from 'lucide-react'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const methodologyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Page entrance animation
    const tl = gsap.timeline()
    tl.fromTo('.page-header', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    )
    .fromTo('.content-section', 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 
      '-=0.4'
    )

    // Features animation
    const featuresTl = gsap.timeline({
      scrollTrigger: {
        trigger: featuresRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    })

    featuresTl.fromTo('.feature-item', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'power3.out' }
    )

    // Methodology animation
    const methodologyTl = gsap.timeline({
      scrollTrigger: {
        trigger: methodologyRef.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    })

    methodologyTl.fromTo('.methodology-step', 
      { x: -50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.3, ease: 'power3.out' }
    )

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze 35 voice biomarkers with 86.61% accuracy",
      color: "primary"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Features",
      description: "Extracts pitch, jitter, shimmer, formants, MFCCs, and spectral characteristics",
      color: "secondary"
    },
    {
      icon: Shield,
      title: "Medical Grade Security",
      description: "HIPAA-compliant data handling with end-to-end encryption and secure processing",
      color: "warning"
    },
    {
      icon: Users,
      title: "Clinical Validation",
      description: "Trained on 823+ voice samples from healthy controls and Parkinson's patients",
      color: "danger"
    },
    {
      icon: TrendingUp,
      title: "Continuous Learning",
      description: "Model improves with new data, ensuring highest accuracy and reliability",
      color: "primary"
    },
    {
      icon: Zap,
      title: "Real-Time Results",
      description: "Get analysis results in under 30 seconds with detailed clinical interpretation",
      color: "secondary"
    }
  ]

  const methodologySteps = [
    {
      step: "01",
      title: "Audio Input",
      description: "Record voice directly or upload WAV file (0.5-60 seconds, max 50MB)",
      icon: FileText
    },
    {
      step: "02",
      title: "Feature Extraction",
      description: "Extract 35 voice features using librosa and Praat analysis tools",
      icon: Database
    },
    {
      step: "03",
      title: "AI Analysis",
      description: "XGBoost model analyzes features and generates prediction probabilities",
      icon: Brain
    },
    {
      step: "04",
      title: "Clinical Interpretation",
      description: "Generate comprehensive report with findings and recommendations",
      icon: CheckCircle
    }
  ]

  const voiceFeatures = {
    "Pitch Analysis": [
      "Fundamental frequency (F0) mean, standard deviation, min, max",
      "Measures voice pitch stability and variability"
    ],
    "Jitter & Shimmer": [
      "Cycle-to-cycle variations in frequency and amplitude",
      "Indicators of voice tremor and instability"
    ],
    "Formant Analysis": [
      "First and second formant frequencies (F1, F2)",
      "Measures vocal tract characteristics and resonance"
    ],
    "Spectral Features": [
      "Spectral centroid, rolloff, and zero-crossing rate",
      "Measures voice brightness and spectral distribution"
    ],
    "MFCC Coefficients": [
      "13 Mel-frequency cepstral coefficients",
      "Captures voice timbre and acoustic characteristics"
    ],
    "Harmonic Analysis": [
      "Harmonics-to-Noise Ratio (HNR)",
      "Measures voice quality and harmonic structure"
    ]
  }

  return (
    <div ref={pageRef} className="min-h-screen">
      {/* Page Header */}
      <section className="gradient-hero section-padding">
        <div className="container-custom">
          <motion.div className="page-header text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              About Our
              <span className="text-gradient block">Voice Detection System</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto">
              Learn about the advanced AI technology, methodology, and clinical validation 
              behind our Parkinson's disease voice detection system.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section ref={featuresRef} className="bg-white section-padding">
        <div className="container-custom">
          <motion.div className="content-section text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Advanced Technology
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our system combines cutting-edge machine learning with medical expertise to provide 
              accurate, reliable voice analysis for early disease detection.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  className="feature-item card p-8 text-center hover-lift"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-20 h-20 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="w-10 h-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section ref={methodologyRef} className="bg-gray-50 section-padding">
        <div className="container-custom">
          <motion.div className="content-section text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
              How It Works
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our voice analysis system follows a sophisticated 4-step process to deliver 
              accurate and clinically relevant results.
            </p>
          </motion.div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {methodologySteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={index}
                    className="methodology-step flex space-x-6"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-600">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Icon className="w-6 h-6 text-primary-600" />
                        <h3 className="text-xl font-semibold text-text-primary">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Voice Features */}
      <section className="bg-white section-padding">
        <div className="container-custom">
          <motion.div className="content-section text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Voice Biomarkers Analyzed
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our system extracts and analyzes 35 different voice characteristics that are 
              scientifically proven to indicate early signs of Parkinson's disease.
            </p>
          </motion.div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Object.entries(voiceFeatures).map(([category, details], index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6"
                >
                  <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                    {category}
                  </h3>
                  <ul className="space-y-2">
                    {details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-text-secondary text-sm leading-relaxed">
                        • {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Model Performance */}
      <section className="bg-gray-50 section-padding">
        <div className="container-custom">
          <motion.div className="content-section text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Model Performance & Validation
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our XGBoost model has been rigorously trained and validated on extensive datasets 
              to ensure reliable and accurate results.
            </p>
          </motion.div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary-600">86.61%</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Accuracy</h3>
                <p className="text-text-secondary text-sm">Overall model accuracy on test set</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-secondary-600">823+</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Samples</h3>
                <p className="text-text-secondary text-sm">Voice samples used for training</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-warning-600">35</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Features</h3>
                <p className="text-text-secondary text-sm">Voice biomarkers analyzed</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-danger-600">&lt;30s</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Speed</h3>
                <p className="text-text-secondary text-sm">Average analysis time</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Disclaimer */}
      <section className="bg-white section-padding">
        <div className="container-custom">
          <motion.div className="content-section max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <div className="flex items-start space-x-4">
                <Info className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-4">
                    Important Clinical Disclaimer
                  </h3>
                  <div className="space-y-3 text-blue-800">
                    <p>
                      This voice analysis system is designed as a screening tool and should not replace 
                      professional medical diagnosis or clinical evaluation.
                    </p>
                    <p>
                      The results are intended to provide preliminary insights and should be discussed 
                      with qualified healthcare providers for proper medical interpretation and follow-up.
                    </p>
                    <p>
                      While our system achieves 86.61% accuracy, no diagnostic tool is 100% accurate. 
                      Always consult with medical professionals for definitive diagnosis and treatment decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 section-padding">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Experience the Technology?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Try our voice analysis system and see how advanced AI can help with early detection 
              of voice changes associated with Parkinson's disease.
            </p>
            <Link 
              href="/analysis" 
              className="btn-secondary text-lg px-8 py-4 hover-lift inline-flex items-center"
            >
              Start Voice Analysis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
