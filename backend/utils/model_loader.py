import os
import joblib
import numpy as np
from pathlib import Path
import traceback

class ModelLoader:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.model_loaded = False
        
    def load_model(self, model_path: str = None):
        """Load the trained XGBoost model and associated files"""
        try:
            if model_path is None:
                possible_base_paths = [
                    Path(__file__).parent.parent / "models",
                    Path("D:/Parkinson/parkinson_voice_model/models"),
                    Path("../parkinson_voice_model/models"),
                    Path("./models"),
                ]
                
                print("🔍 Searching for model files...")
                
                base_path = None
                for path in possible_base_paths:
                    print(f"  Checking: {path.absolute()}")
                    if path.exists():
                        model_file = path / "parkinsons_xgboost_model.pkl"
                        if model_file.exists():
                            base_path = path
                            print(f"  ✅ Found models at: {path.absolute()}")
                            break
                
                if base_path is None:
                    raise FileNotFoundError("Model files not found")
                
                model_path = base_path / "parkinsons_xgboost_model.pkl"
                scaler_path = base_path / "parkinsons_xgboost_model_scaler.pkl"
                features_path = base_path / "parkinsons_xgboost_model_features.pkl"
            
            print(f"📁 Model files:")
            print(f"  Model: {model_path}")
            print(f"  Scaler: {scaler_path}")
            print(f"  Features: {features_path}")
            
            # Check if all files exist
            missing_files = []
            for file_path, name in [(model_path, "model"), (scaler_path, "scaler"), (features_path, "features")]:
                if not file_path.exists():
                    missing_files.append(f"{name} ({file_path})")
                else:
                    print(f"  ✅ Found {name}")
            
            if missing_files:
                raise FileNotFoundError(f"Missing files: {', '.join(missing_files)}")
            
            # Load model components
            print("🔄 Loading model components...")
            
            print("  Loading XGBoost model...")
            self.model = joblib.load(model_path)
            print("  ✅ Model loaded")
            
            print("  Loading scaler...")
            self.scaler = joblib.load(scaler_path)
            print("  ✅ Scaler loaded")
            
            print("  Loading feature names...")
            self.feature_names = joblib.load(features_path)
            print(f"  ✅ Features loaded ({len(self.feature_names)} features)")
            
            self.model_loaded = True
            print(f"🎉 Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            print(f"Full traceback:")
            traceback.print_exc()
            return False
    
    def load_models(self):
        """Compatibility method"""
        return self.load_model()
    
    def predict(self, features):
        """Make prediction using loaded model with proper feature handling"""
        if not self.model_loaded:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            print(f"🔍 Prediction input type: {type(features)}")
            print(f"🔍 Prediction input shape: {np.array(features).shape if hasattr(features, 'shape') or isinstance(features, (list, np.ndarray)) else 'Not array-like'}")
            
            # Handle different input formats
            if isinstance(features, dict):
                # Convert dict to feature vector using expected feature names
                feature_values = []
                for feature_name in self.feature_names:
                    if feature_name in features:
                        value = features[feature_name]
                        # Flatten any multidimensional features
                        if isinstance(value, (list, np.ndarray)):
                            value = np.array(value)
                            if value.ndim > 0:
                                value = np.mean(value)  # Take mean if multidimensional
                        feature_values.append(float(value))
                    else:
                        feature_values.append(0.0)
                
                feature_vector = np.array(feature_values)
                
            elif isinstance(features, (list, np.ndarray)):
                feature_vector = np.array(features)
                
                # Handle multidimensional arrays - flatten to 1D
                if feature_vector.ndim > 1:
                    print(f"⚠️ Flattening {feature_vector.ndim}D array to 1D")
                    # If it's 2D, take mean across time dimension
                    if feature_vector.ndim == 2:
                        feature_vector = np.mean(feature_vector, axis=0)
                    else:
                        feature_vector = feature_vector.flatten()
                
                # Ensure we have the right number of features
                expected_features = len(self.feature_names)
                if len(feature_vector) != expected_features:
                    print(f"⚠️ Feature count mismatch: got {len(feature_vector)}, expected {expected_features}")
                    if len(feature_vector) > expected_features:
                        feature_vector = feature_vector[:expected_features]
                    else:
                        # Pad with zeros
                        padded = np.zeros(expected_features)
                        padded[:len(feature_vector)] = feature_vector
                        feature_vector = padded
                        
            else:
                raise ValueError(f"Unsupported features type: {type(features)}")
            
            # Ensure 1D array for scaling
            feature_vector = np.array(feature_vector).flatten()
            
            print(f"🔍 Final feature vector shape: {feature_vector.shape}")
            print(f"🔍 Final feature vector sample: {feature_vector[:5]}...")
            
            # Handle missing and infinite values
            feature_vector = np.nan_to_num(feature_vector, nan=0.0, posinf=0.0, neginf=0.0)
            
            # Scale features (reshape to 2D for scaler)
            features_scaled = self.scaler.transform([feature_vector])
            
            print(f"🔍 Scaled features shape: {features_scaled.shape}")
            
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
            
            print(f"✅ Prediction successful: {result['prediction_label']} ({result['confidence']:.3f})")
            return result
        
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            traceback.print_exc()
            raise
    
    def get_feature_importance(self):
        """Get feature importance from the model"""
        if not self.model_loaded:
            return {}
        
        try:
            # Get feature importance from XGBoost
            feature_importance = self.model.feature_importances_
            
            # Create dictionary with feature names and importance scores
            importance_dict = {}
            for i, importance in enumerate(feature_importance):
                if i < len(self.feature_names):
                    importance_dict[self.feature_names[i]] = float(importance)
            
            return importance_dict
        except Exception as e:
            print(f"❌ Error getting feature importance: {str(e)}")
            return {}