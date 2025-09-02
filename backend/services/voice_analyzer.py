import time
import logging
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from datetime import datetime

from models.prediction_models import (
    PredictionResponse, FeatureImportance, ClinicalInterpretation
)
from services.model_loader import ModelLoader
from services.feature_extractor import VoiceFeatureExtractor

logger = logging.getLogger(__name__)

class VoiceAnalyzer:
    """Main service for analyzing voice samples and making predictions"""
    
    def __init__(self, model_loader: ModelLoader, feature_extractor: VoiceFeatureExtractor):
        self.model_loader = model_loader
        self.feature_extractor = feature_extractor
        
    async def analyze_voice(self, file_path: str) -> PredictionResponse:
        """Analyze voice sample from file and return prediction results"""
        start_time = time.time()
        
        try:
            logger.info(f"Starting voice analysis for: {file_path}")
            
            # Extract features
            features = self.feature_extractor.extract_all_features(file_path)
            if features is None:
                raise RuntimeError("Failed to extract features from audio file")
            
            # Get audio duration
            audio_duration = features.get('duration', 0.0)
            
            # Prepare features for prediction
            X = self._prepare_features_for_prediction(features)
            
            # Make prediction
            prediction_result = self.model_loader.predict(X)
            
            # Get feature importance
            feature_importance = self.model_loader.get_feature_importance()
            
            # Create response
            response = self._create_prediction_response(
                prediction=prediction_result['prediction'],
                probabilities=np.array([prediction_result['probability_healthy'], prediction_result['probability_pd']]),
                features=features,
                feature_importance=feature_importance,
                processing_time=time.time() - start_time,
                audio_duration=audio_duration,
                file_path=file_path
            )
            
            logger.info(f"Voice analysis completed successfully for: {file_path}")
            return response
            
        except Exception as e:
            logger.error(f"Error analyzing voice: {str(e)}")
            raise
    
    async def analyze_recorded_audio(self, audio_data: str) -> PredictionResponse:
        """Analyze voice sample from recorded audio data"""
        start_time = time.time()
        
        try:
            logger.info("Starting voice analysis for recorded audio")
            
            # Extract features from base64 audio
            features = self.feature_extractor.extract_features_from_base64(audio_data)
            if features is None:
                raise RuntimeError("Failed to extract features from recorded audio")
            
            # Get audio duration
            audio_duration = features.get('duration', 0.0)
            
            # Prepare features for prediction
            X = self._prepare_features_for_prediction(features)
            
            # Make prediction
            prediction_result = self.model_loader.predict(X)
            
            # Get feature importance
            feature_importance = self.model_loader.get_feature_importance()
            
            # Create response
            response = self._create_prediction_response(
                prediction=prediction_result['prediction'],
                probabilities=np.array([prediction_result['probability_healthy'], prediction_result['probability_pd']]),
                features=features,
                feature_importance=feature_importance,
                processing_time=time.time() - start_time,
                audio_duration=audio_duration,
                file_path=None
            )
            
            logger.info("Voice analysis completed successfully for recorded audio")
            return response
            
        except Exception as e:
            logger.error(f"Error analyzing recorded audio: {str(e)}")
            raise
    
    def _prepare_features_for_prediction(self, features: Dict[str, Any]) -> np.ndarray:
        """Prepare features for model prediction"""
        try:
            # Get expected feature names
            expected_features = self.model_loader.feature_names
            
            # Create feature vector
            feature_vector = []
            for feature_name in expected_features:
                if feature_name in features:
                    feature_vector.append(features[feature_name])
                else:
                    # Use default value for missing features
                    feature_vector.append(0.0)
            
            # Convert to numpy array and reshape
            X = np.array(feature_vector).reshape(1, -1)
            
            # Handle missing and infinite values
            X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
            
            return X
            
        except Exception as e:
            logger.error(f"Error preparing features: {str(e)}")
            raise
    
    def _create_prediction_response(
        self,
        prediction: int,
        probabilities: np.ndarray,
        features: Dict[str, Any],
        feature_importance: Dict[str, float],
        processing_time: float,
        audio_duration: float,
        file_path: Optional[str] = None
    ) -> PredictionResponse:
        """Create the prediction response object"""
        
        # Basic prediction info
        prediction_label = "Parkinson's Disease" if prediction == 1 else "Healthy"
        confidence = float(max(probabilities))
        confidence_percentage = f"{confidence * 100:.1f}%"
        
        # Probability scores
        probability_healthy = float(probabilities[0])
        probability_pd = float(probabilities[1])
        
        # Top contributing features
        top_features = self._get_top_features(features, feature_importance)
        
        # Clinical interpretation
        clinical_interpretation = self._create_clinical_interpretation(
            prediction, confidence, features
        )
        
        # File information
        file_name = None
        file_size = None
        if file_path:
            import os
            file_name = os.path.basename(file_path)
            try:
                file_size = os.path.getsize(file_path)
            except:
                file_size = None
        
        return PredictionResponse(
            prediction=prediction,
            prediction_label=prediction_label,
            confidence=confidence,
            confidence_percentage=confidence_percentage,
            probability_healthy=probability_healthy,
            probability_pd=probability_pd,
            top_features=top_features,
            all_features=features,
            clinical_interpretation=clinical_interpretation,
            processing_time=processing_time,
            audio_duration=audio_duration,
            timestamp=datetime.now(),
            file_name=file_name,
            file_size=file_size
        )
    
    def _get_top_features(
        self, 
        features: Dict[str, Any], 
        feature_importance: Dict[str, float]
    ) -> List[FeatureImportance]:
        """Get top contributing features with descriptions"""
        
        # Get feature descriptions
        feature_descriptions = self.feature_extractor.get_feature_descriptions()
        
        # Create feature importance list
        feature_list = []
        for feature_name, importance_score in feature_importance.items():
            if feature_name in features:
                # Find category and description
                category = "Other"
                description = "Voice characteristic feature"
                
                for cat_name, cat_features in feature_descriptions.items():
                    if feature_name in cat_features:
                        category = cat_name.replace("_", " ").title()
                        description = cat_features[feature_name]
                        break
                
                feature_list.append(FeatureImportance(
                    feature_name=feature_name,
                    importance_score=float(importance_score),
                    description=description,
                    category=category
                ))
        
        # Sort by importance and take top 10
        feature_list.sort(key=lambda x: x.importance_score, reverse=True)
        return feature_list[:10]
    
    def _create_clinical_interpretation(
        self, 
        prediction: int, 
        confidence: float, 
        features: Dict[str, Any]
    ) -> ClinicalInterpretation:
        """Create clinical interpretation of the results"""
        
        if prediction == 1:  # Parkinson's Disease
            if confidence > 0.8:
                risk_level = "High"
                overall_assessment = "The voice analysis suggests significant signs consistent with Parkinson's disease."
            elif confidence > 0.6:
                risk_level = "Moderate"
                overall_assessment = "The voice analysis indicates moderate signs that may be associated with Parkinson's disease."
            else:
                risk_level = "Low"
                overall_assessment = "The voice analysis shows mild signs that could be related to Parkinson's disease."
            
            key_findings = [
                "Voice tremor and instability detected",
                "Reduced vocal control and precision",
                "Changes in pitch and amplitude patterns",
                "Potential dysarthria indicators present"
            ]
            
            recommendations = [
                "Consult with a neurologist for comprehensive evaluation",
                "Consider speech therapy for voice improvement",
                "Monitor voice changes over time",
                "Maintain regular medical follow-ups"
            ]
            
        else:  # Healthy
            if confidence > 0.8:
                risk_level = "Very Low"
                overall_assessment = "The voice analysis indicates healthy vocal characteristics with no concerning patterns."
            elif confidence > 0.6:
                risk_level = "Low"
                overall_assessment = "The voice analysis suggests generally healthy vocal patterns with minor variations."
            else:
                risk_level = "Low"
                overall_assessment = "The voice analysis shows mostly healthy characteristics, though confidence is limited."
            
            key_findings = [
                "Stable pitch and amplitude patterns",
                "Normal vocal control and precision",
                "Consistent voice quality indicators",
                "No significant dysarthria signs detected"
            ]
            
            recommendations = [
                "Continue regular voice monitoring",
                "Maintain good vocal hygiene practices",
                "Consider annual voice assessments",
                "Report any sudden voice changes to healthcare providers"
            ]
        
        # Determine confidence level
        if confidence > 0.8:
            confidence_level = "High"
        elif confidence > 0.6:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"
        
        return ClinicalInterpretation(
            overall_assessment=overall_assessment,
            key_findings=key_findings,
            recommendations=recommendations,
            risk_level=risk_level,
            confidence_level=confidence_level
        )
    
    def get_analysis_summary(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Get a summary of the voice analysis"""
        summary = {
            "total_features": len(features),
            "feature_categories": {
                "pitch_analysis": len([f for f in features.keys() if f.startswith('pitch')]),
                "jitter_shimmer": len([f for f in features.keys() if 'jitter' in f or 'shimmer' in f]),
                "formant_analysis": len([f for f in features.keys() if 'formant' in f]),
                "spectral_features": len([f for f in features.keys() if 'spectral' in f]),
                "mfcc_coefficients": len([f for f in features.keys() if 'mfcc' in f]),
                "other_features": len([f for f in features.keys() if f not in ['duration'] and not any(x in f for x in ['pitch', 'jitter', 'shimmer', 'formant', 'spectral', 'mfcc'])])
            },
            "audio_duration": features.get('duration', 0.0),
            "feature_ranges": {
                "pitch_range": {
                    "min": features.get('pitch_min', 0.0),
                    "max": features.get('pitch_max', 0.0),
                    "mean": features.get('pitch_mean', 0.0)
                },
                "jitter_range": {
                    "percent": features.get('jitter_percent', 0.0),
                    "absolute": features.get('jitter_abs', 0.0)
                },
                "shimmer_range": {
                    "percent": features.get('shimmer_percent', 0.0),
                    "absolute": features.get('shimmer_abs', 0.0)
                }
            }
        }
        
        return summary
