"""
Spiral Analysis Service
Analyzes spiral drawing patterns for motor skill assessment and Parkinson's detection
"""

import logging
import numpy as np
from typing import Dict, Any, Optional
import base64
import io
from PIL import Image
import cv2
import tempfile
import os

logger = logging.getLogger(__name__)

class SpiralAnalysisService:
    """Service for analyzing spiral drawings using traditional ML"""
    
    def __init__(self):
        self.model = None
        self.feature_names = None
        self._load_model()
    
    def _load_model(self):
        """Load the pre-trained spiral analysis model"""
        try:
            # For now, we'll use a mock model
            # In production, this would load a real ML model
            logger.info("✅ Spiral model loaded (mock implementation)")
            self.model = "mock_spiral_model"
            self.feature_names = [
                'tremor_amplitude', 'tremor_frequency', 'drawing_speed',
                'spiral_tightness', 'line_smoothness', 'pressure_variation',
                'drawing_time', 'pen_lift_count', 'spiral_deviation',
                'stroke_length_mean', 'stroke_length_std', 'angular_velocity',
                'curvature_variation', 'spiral_radius_mean', 'spiral_radius_std',
                'drawing_consistency', 'motor_control_score', 'tremor_severity',
                'coordination_index', 'fluidity_measure'
            ]
        except Exception as e:
            logger.error(f"Failed to load spiral model: {e}")
            self.model = None
    
    async def analyze_spiral(self, spiral_data: str, drawing_time: Optional[float] = None) -> Dict[str, Any]:
        """Analyze spiral drawing for Parkinson's disease detection"""
        try:
            if not self.model:
                raise Exception("Spiral model not loaded")
            
            # Decode base64 image data
            image = self._decode_image(spiral_data)
            
            # Extract features from the drawing
            features = self._extract_spiral_features(image, drawing_time)
            
            # Mock prediction (replace with actual model inference)
            prediction_result = self._mock_prediction(features, drawing_time)
            
            # Add metadata
            result = {
                **prediction_result,
                "model_type": "Spiral Analysis",
                "processing_time": 1.8,  # Mock processing time
                "clinical_notes": self._generate_clinical_notes(prediction_result, features),
                "key_features": self._get_key_features(features),
                "drawing_metrics": {
                    "total_drawing_time": drawing_time or 0.0,
                    "line_smoothness": features.get('line_smoothness', 0.0),
                    "tremor_amplitude": features.get('tremor_amplitude', 0.0),
                    "spiral_consistency": features.get('drawing_consistency', 0.0)
                }
            }
            
            logger.info("✅ Spiral analysis completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Spiral analysis failed: {e}")
            raise
    
    def _decode_image(self, spiral_data: str) -> Image.Image:
        """Decode base64 image data"""
        try:
            # Remove data URL prefix if present
            if spiral_data.startswith('data:image'):
                spiral_data = spiral_data.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(spiral_data)
            image = Image.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            return image
            
        except Exception as e:
            raise Exception(f"Failed to decode image: {e}")
    
    def _extract_spiral_features(self, image: Image.Image, drawing_time: Optional[float]) -> Dict[str, float]:
        """Extract features from spiral drawing"""
        try:
            # Convert PIL image to OpenCV format
            img_array = np.array(image)
            img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            
            # Mock feature extraction (replace with real feature extraction)
            features = {}
            
            # Simulate feature extraction based on image properties
            np.random.seed(hash(str(img_cv.tobytes())) % 2**32)
            
            # Motor control features
            features['tremor_amplitude'] = np.random.uniform(0.1, 0.9)
            features['tremor_frequency'] = np.random.uniform(0.2, 0.8)
            features['drawing_speed'] = np.random.uniform(0.3, 0.9)
            features['spiral_tightness'] = np.random.uniform(0.4, 0.95)
            features['line_smoothness'] = np.random.uniform(0.2, 0.9)
            features['pressure_variation'] = np.random.uniform(0.1, 0.8)
            
            # Drawing metrics
            features['drawing_time'] = drawing_time or np.random.uniform(10.0, 60.0)
            features['pen_lift_count'] = np.random.randint(0, 10)
            features['spiral_deviation'] = np.random.uniform(0.1, 0.8)
            
            # Stroke analysis
            features['stroke_length_mean'] = np.random.uniform(5.0, 25.0)
            features['stroke_length_std'] = np.random.uniform(1.0, 8.0)
            features['angular_velocity'] = np.random.uniform(0.5, 2.5)
            
            # Spatial features
            features['curvature_variation'] = np.random.uniform(0.2, 0.9)
            features['spiral_radius_mean'] = np.random.uniform(50.0, 150.0)
            features['spiral_radius_std'] = np.random.uniform(5.0, 25.0)
            
            # Composite scores
            features['drawing_consistency'] = np.random.uniform(0.3, 0.9)
            features['motor_control_score'] = np.random.uniform(0.4, 0.95)
            features['tremor_severity'] = np.random.uniform(0.1, 0.8)
            features['coordination_index'] = np.random.uniform(0.2, 0.9)
            features['fluidity_measure'] = np.random.uniform(0.3, 0.9)
            
            return features
            
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            # Return default features if extraction fails
            return {name: 0.5 for name in self.feature_names}
    
    def _mock_prediction(self, features: Dict[str, float], drawing_time: Optional[float]) -> Dict[str, Any]:
        """Mock prediction (replace with actual model inference)"""
        try:
            # Calculate composite score based on features
            motor_score = features.get('motor_control_score', 0.5)
            tremor_score = features.get('tremor_severity', 0.5)
            consistency_score = features.get('drawing_consistency', 0.5)
            
            # Normalize drawing time influence
            time_factor = 1.0
            if drawing_time:
                # Optimal drawing time is around 30 seconds
                if drawing_time < 15:
                    time_factor = 0.8  # Too fast
                elif drawing_time > 60:
                    time_factor = 0.7  # Too slow
                else:
                    time_factor = 1.0  # Optimal
            
            # Calculate probability of Parkinson's Disease
            # Higher tremor, lower motor control, and lower consistency increase PD probability
            pd_probability = (
                (1.0 - motor_score) * 0.4 +      # Motor control (40% weight)
                tremor_score * 0.3 +              # Tremor severity (30% weight)
                (1.0 - consistency_score) * 0.2 + # Consistency (20% weight)
                (1.0 - time_factor) * 0.1        # Time factor (10% weight)
            )
            
            # Clamp probability
            pd_probability = np.clip(pd_probability, 0.1, 0.9)
            healthy_probability = 1.0 - pd_probability
            
            # Determine prediction
            prediction = 1 if pd_probability > 0.5 else 0
            prediction_label = "Parkinson's Disease" if prediction == 1 else "Healthy"
            
            # Calculate confidence based on feature consistency
            feature_std = np.std(list(features.values()))
            confidence = 0.6 + (1.0 - feature_std) * 0.3  # Lower std = higher confidence
            confidence = np.clip(confidence, 0.3, 0.95)
            
            return {
                "prediction": prediction,
                "prediction_label": prediction_label,
                "confidence": confidence,
                "probability_pd": pd_probability,
                "probability_healthy": healthy_probability
            }
            
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            # Return default prediction
            return {
                "prediction": 0,
                "prediction_label": "Healthy",
                "confidence": 0.5,
                "probability_pd": 0.5,
                "probability_healthy": 0.5
            }
    
    def _get_key_features(self, features: Dict[str, float]) -> list:
        """Get key features with importance scores"""
        # Sort features by importance (mock implementation)
        feature_importance = [
            ('tremor_amplitude', 0.95),
            ('motor_control_score', 0.92),
            ('drawing_consistency', 0.88),
            ('line_smoothness', 0.85),
            ('tremor_severity', 0.82),
            ('spiral_deviation', 0.78),
            ('pressure_variation', 0.75),
            ('coordination_index', 0.72)
        ]
        
        key_features = []
        for feature_name, importance in feature_importance:
            if feature_name in features:
                key_features.append({
                    "feature_name": feature_name,
                    "importance_score": importance,
                    "description": self._get_feature_description(feature_name),
                    "category": self._get_feature_category(feature_name),
                    "value": features[feature_name]
                })
        
        return key_features
    
    def _get_feature_description(self, feature_name: str) -> str:
        """Get description for a feature"""
        descriptions = {
            'tremor_amplitude': 'Amplitude of hand tremor during drawing',
            'motor_control_score': 'Overall motor control and coordination',
            'drawing_consistency': 'Consistency of spiral shape and spacing',
            'line_smoothness': 'Smoothness of drawn lines',
            'tremor_severity': 'Severity of tremor patterns',
            'spiral_deviation': 'Deviation from ideal spiral shape',
            'pressure_variation': 'Variation in pen pressure',
            'coordination_index': 'Hand-eye coordination quality'
        }
        return descriptions.get(feature_name, f"Feature: {feature_name}")
    
    def _get_feature_category(self, feature_name: str) -> str:
        """Get category for a feature"""
        categories = {
            'tremor_amplitude': 'motor',
            'motor_control_score': 'motor',
            'drawing_consistency': 'quality',
            'line_smoothness': 'quality',
            'tremor_severity': 'motor',
            'spiral_deviation': 'spatial',
            'pressure_variation': 'motor',
            'coordination_index': 'motor'
        }
        return categories.get(feature_name, 'general')
    
    def _generate_clinical_notes(self, prediction_result: Dict[str, Any], features: Dict[str, float]) -> str:
        """Generate clinical interpretation notes"""
        prediction = prediction_result['prediction']
        confidence = prediction_result['confidence']
        probability_pd = prediction_result['probability_pd']
        
        if prediction == 1:  # Parkinson's Disease
            if confidence > 0.8:
                severity = "high confidence"
            elif confidence > 0.6:
                severity = "moderate confidence"
            else:
                severity = "low confidence"
            
            notes = f"Spiral drawing analysis shows {severity} for motor control deficits "
            notes += f"(probability: {probability_pd:.1%}). "
            
            # Add specific observations
            if features.get('tremor_amplitude', 0) > 0.7:
                notes += "Significant tremor amplitude detected during drawing. "
            if features.get('motor_control_score', 0) < 0.4:
                notes += "Reduced motor control and coordination observed. "
            if features.get('drawing_consistency', 0) < 0.5:
                notes += "Inconsistent spiral shape indicates motor planning issues. "
                
        else:  # Healthy
            if confidence > 0.8:
                notes = "Spiral drawing analysis shows normal motor control "
                notes += f"(confidence: {confidence:.1%}). "
                notes += "Drawing patterns are within normal ranges."
            else:
                notes = "Spiral drawing analysis suggests normal motor function, "
                notes += "though with limited confidence. Clinical correlation recommended."
        
        return notes
