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
            # Try multiple possible paths for model files
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
                        else:
                            print(f"  ❌ Path exists but no model file found")
                    else:
                        print(f"  ❌ Path doesn't exist")
                
                if base_path is None:
                    # List all files in current directory for debugging
                    current_dir = Path(__file__).parent.parent
                    print(f"Current directory contents: {list(current_dir.iterdir())}")
                    raise FileNotFoundError("Model files not found in any expected location")
                
                model_path = base_path / "parkinsons_xgboost_model.pkl"
                scaler_path = base_path / "parkinsons_xgboost_model_scaler.pkl"
                features_path = base_path / "parkinsons_xgboost_model_features.pkl"
            else:
                # Use provided path
                model_path = Path(model_path)
                base_dir = model_path.parent
                model_name = model_path.stem
                scaler_path = base_dir / f"{model_name}_scaler.pkl"
                features_path = base_dir / f"{model_name}_features.pkl"
            
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
    
    async def load_models(self):
        """Async wrapper for load_model"""
        return self.load_model()
    
    def predict(self, features):
        """Make prediction using loaded model"""
        if not self.model_loaded:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            # Ensure features is the right shape
            if isinstance(features, dict):
                # Convert dict to list in correct order
                feature_values = [features.get(name, 0) for name in self.feature_names]
            else:
                feature_values = features
            
            # Scale features
            features_scaled = self.scaler.transform([feature_values])
            
            # Make prediction
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            return {
                'prediction': int(prediction),
                'prediction_label': 'Parkinson\'s Disease' if prediction == 1 else 'Healthy',
                'probability_healthy': float(probabilities[0]),
                'probability_pd': float(probabilities[1]),
                'confidence': float(max(probabilities))
            }
        
        except Exception as e:
            print(f"❌ Prediction error: {str(e)}")
            traceback.print_exc()
            raise
