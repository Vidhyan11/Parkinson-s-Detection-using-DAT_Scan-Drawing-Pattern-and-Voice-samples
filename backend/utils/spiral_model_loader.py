# Spiral Model Loader - Working Version  
# Save as: utils\spiral_model_loader.py

import os
import joblib
import numpy as np
from pathlib import Path
import traceback
import logging

logger = logging.getLogger(__name__)

class SpiralModelLoader:
    """Model loader for Spiral PKL models"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_loaded = False
        
    def load_model(self, model_path: str = None):
        """Load the Spiral PKL model"""
        try:
            if model_path is None:
                possible_base_paths = [
                    Path(__file__).parent.parent / "models" / "spiral_models",
                    Path("models/spiral_models"),
                ]
                
                print("🔍 Searching for Spiral model...")
                
                base_path = None
                for path in possible_base_paths:
                    print(f"  Checking: {path.absolute()}")
                    if path.exists():
                        model_file = path / "spiral_model.pkl"
                        if model_file.exists():
                            base_path = path
                            print(f"  ✅ Found Spiral model at: {path.absolute()}")
                            break
                
                if base_path is None:
                    raise FileNotFoundError("Spiral PKL model not found")
                
                model_path = base_path / "spiral_model.pkl"
                scaler_path = base_path / "spiral_scaler.pkl"
                features_path = base_path / "spiral_features.pkl"
            
            print(f"📁 Spiral model files:")
            print(f"  Model: {model_path}")
            print(f"  Scaler: {scaler_path}")
            print(f"  Features: {features_path}")
            
            # Load model components
            print("🔄 Loading Spiral model components...")
            
            self.model = joblib.load(model_path)
            print("  ✅ Model loaded")
            
            self.scaler = joblib.load(scaler_path)
            print("  ✅ Scaler loaded")
            
            self.feature_names = joblib.load(features_path)
            print(f"  ✅ Features loaded ({len(self.feature_names)} features)")
            
            self.model_loaded = True
            print(f"🎉 Spiral model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error loading Spiral model: {str(e)}")
            traceback.print_exc()
            return False
    
    def load_models(self):
        """Compatibility method"""
        return self.load_model()
    
    def predict(self, features):
        """Make prediction using Spiral model"""
        if not self.model_loaded:
            raise ValueError("Spiral model not loaded")
        
        try:
            print(f"🔍 Spiral prediction input: {type(features)}")
            
            # Handle different input formats
            if isinstance(features, dict):
                # Convert dict to feature vector
                feature_values = []
                for feature_name in self.feature_names:
                    if feature_name in features:
                        value = features[feature_name]
                        if isinstance(value, (list, np.ndarray)):
                            value = np.mean(value)
                        feature_values.append(float(value))
                    else:
                        feature_values.append(0.0)
                feature_vector = np.array(feature_values)
                
            elif isinstance(features, (list, np.ndarray)):
                feature_vector = np.array(features).flatten()
                
                # Ensure correct number of features
                expected_features = len(self.feature_names)
                if len(feature_vector) != expected_features:
                    if len(feature_vector) > expected_features:
                        feature_vector = feature_vector[:expected_features]
                    else:
                        padded = np.zeros(expected_features)
                        padded[:len(feature_vector)] = feature_vector
                        feature_vector = padded
            else:
                raise ValueError(f"Unsupported features type: {type(features)}")
            
            # Handle missing values
            feature_vector = np.nan_to_num(feature_vector, nan=0.0, posinf=0.0, neginf=0.0)
            
            # Scale features
            features_scaled = self.scaler.transform([feature_vector])
            
            # Make prediction
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            result = {
                'prediction': int(prediction),
                'prediction_label': 'Parkinson\'s Disease' if prediction == 1 else 'Healthy',
                'probability_healthy': float(probabilities[0]),
                'probability_pd': float(probabilities[1]),
                'confidence': float(max(probabilities))
            }
            
            print(f"✅ Spiral prediction: {result['prediction_label']} ({result['confidence']:.3f})")
            return result
        
        except Exception as e:
            print(f"❌ Spiral prediction error: {str(e)}")
            traceback.print_exc()
            raise
    
    def get_feature_importance(self):
        """Get feature importance from Spiral model"""
        if not self.model_loaded:
            return {}
        
        try:
            if hasattr(self.model, 'feature_importances_'):
                feature_importance = self.model.feature_importances_
            elif hasattr(self.model, 'coef_'):
                coefficients = self.model.coef_[0] if len(self.model.coef_.shape) > 1 else self.model.coef_
                feature_importance = np.abs(coefficients)
            else:
                feature_importance = np.ones(len(self.feature_names))
            
            importance_dict = {}
            for i, importance in enumerate(feature_importance):
                if i < len(self.feature_names):
                    importance_dict[self.feature_names[i]] = float(importance)
            
            return importance_dict
            
        except Exception as e:
            print(f"❌ Error getting Spiral feature importance: {str(e)}")
            return {}