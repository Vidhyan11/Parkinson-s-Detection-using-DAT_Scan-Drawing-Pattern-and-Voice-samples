import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const patientAge = formData.get('patient_age')
    const patientGender = formData.get('patient_gender')
    const voiceFile = formData.get('voice_file')
    const voiceDuration = formData.get('voice_duration')
    const datscanFile = formData.get('datscan_file')
    const spiralFile = formData.get('spiral_file')
    const spiralDrawingTime = formData.get('spiral_drawing_time')

    console.log('Received analysis request:', {
      patientAge,
      patientGender,
      hasVoice: !!voiceFile,
      hasDatscan: !!datscanFile,
      hasSpiral: !!spiralFile
    })

    // Create proper results structure that matches the results page expectations
    const mockResults = {
      // Main fusion results
      fusion_prediction: 0, // 0 = Healthy, 1 = Parkinson's
      fusion_prediction_label: "Healthy",
      fusion_confidence: 0.78,
      fusion_probability_pd: 0.35, // 35% chance of PD
      fusion_probability_healthy: 0.65, // 65% chance of healthy
      
      // Models used
      models_used: ['voice', 'datscan', 'spiral'],
      
      // Processing time
      total_processing_time: 4.2,
      
      // Fusion weights
      fusion_weights: {
        voice: 0.20,
        datscan: 0.50,
        spiral: 0.30
      },
      
      // Individual model results
      individual_results: {
        voice: voiceFile ? {
          model_type: 'voice analysis',
          prediction: 0,
          prediction_label: 'Healthy',
          confidence: 0.75,
          probability_pd: 0.40,
          probability_healthy: 0.60,
          processing_time: 1.8,
          key_features: [
            { feature_name: 'pitch_variability', importance_score: 0.32, description: 'Variation in pitch stability', category: 'acoustic' },
            { feature_name: 'jitter', importance_score: 0.28, description: 'Cycle-to-cycle frequency variation', category: 'acoustic' },
            { feature_name: 'shimmer', importance_score: 0.24, description: 'Cycle-to-cycle amplitude variation', category: 'acoustic' }
          ]
        } : null,
        datscan: datscanFile ? {
          model_type: 'datscan analysis',
          prediction: 0,
          prediction_label: 'Healthy',
          confidence: 0.80,
          probability_pd: 0.30,
          probability_healthy: 0.70,
          processing_time: 2.6,
          key_features: [
            { feature_name: 'striatal_binding_ratio', importance_score: 0.41, description: 'Striatal dopamine transporter uptake', category: 'imaging' },
            { feature_name: 'caudate_putamen_ratio', importance_score: 0.27, description: 'Relative uptake in caudate vs putamen', category: 'imaging' }
          ]
        } : null,
        spiral: spiralFile ? {
          model_type: 'spiral analysis',
          prediction: 0,
          prediction_label: 'Healthy',
          confidence: 0.70,
          probability_pd: 0.45,
          probability_healthy: 0.55,
          processing_time: 1.4,
          key_features: [
            { feature_name: 'tremor_frequency', importance_score: 0.36, description: 'Dominant tremor harmonic in drawing', category: 'motor' },
            { feature_name: 'drawing_smoothness', importance_score: 0.22, description: 'Stroke continuity and smoothness', category: 'motor' }
          ],
          drawing_time: spiralDrawingTime
        } : null
      },
      
      // Clinical information
      clinical_summary: "Based on the multi-modal analysis, the patient shows healthy patterns across all three assessment modalities. Voice analysis indicates normal acoustic parameters, DATScan shows typical brain imaging patterns, and spiral drawing demonstrates good motor control without tremor indicators.",
      
      // Recommendations
      recommendations: [
        "Continue regular health monitoring",
        "No immediate intervention required",
        "Follow up in 6 months for routine assessment"
      ],
      
      // Patient info
      patient_info: {
        age: patientAge,
        gender: patientGender
      }
    }

    return NextResponse.json(mockResults)
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    )
  }
}
