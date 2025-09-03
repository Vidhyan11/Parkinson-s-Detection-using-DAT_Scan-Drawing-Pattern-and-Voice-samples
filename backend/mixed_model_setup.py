# Mixed Model Setup Script
# Run this in D:\Parkinson\backend directory

import joblib
import numpy as np
from pathlib import Path
import os

def setup_datscan_dl_model():
    """Setup DATScan Deep Learning model (H5 format) - no preprocessing needed"""
    
    print("🧠 Setting up DATScan Deep Learning Model...")
    
    # Create directory
    Path("models/datscan_models").mkdir(parents=True, exist_ok=True)
    
    # Check if H5 model exists
    h5_path = "models/datscan_models/datscan_model.h5"
    if not os.path.exists(h5_path):
        print(f"⚠️ Please place your DATScan H5 model at: {h5_path}")
        return False
    
    # For DL models, we don't need separate scaler - preprocessing is handled differently
    # Create dummy feature names for consistency (DL models often don't need explicit feature names)
    feature_names = ["datscan_dl_features"]  # Single entry for DL model
    
    # Save feature names (minimal for DL)
    joblib.dump(feature_names, "models/datscan_models/datscan_features.pkl")
    
    # Create minimal scaler (identity - no scaling for DL)
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    scaler.mean_ = np.array([0.0])  # Single dummy value
    scaler.scale_ = np.array([1.0])  # No scaling
    scaler.n_features_in_ = 1
    
    joblib.dump(scaler, "models/datscan_models/datscan_scaler.pkl")
    
    print("✅ DATScan DL model setup complete!")
    print(f"   Model: {h5_path}")
    print(f"   Features: models/datscan_models/datscan_features.pkl")
    print(f"   Scaler: models/datscan_models/datscan_scaler.pkl (identity)")
    
    return True

def setup_spiral_ml_model():
    """Setup Spiral ML model (PKL format) with feature inspection"""
    
    print("🎯 Setting up Spiral ML Model...")
    
    # Create directory  
    Path("models/spiral_models").mkdir(parents=True, exist_ok=True)
    
    # Check if PKL model exists
    pkl_path = "models/spiral_models/spiral_model.pkl"
    if not os.path.exists(pkl_path):
        print(f"⚠️ Please place your Spiral PKL model at: {pkl_path}")
        return False
    
    try:
        # Load and inspect the spiral model
        model = joblib.load(pkl_path)
        print(f"📊 Model type: {type(model)}")
        
        # Try to determine feature count
        n_features = None
        if hasattr(model, 'n_features_in_'):
            n_features = model.n_features_in_
            print(f"✅ Found {n_features} features in model")
        elif hasattr(model, 'coef_'):
            if hasattr(model.coef_, 'shape'):
                if len(model.coef_.shape) > 1:
                    n_features = model.coef_.shape[1]
                else:
                    n_features = len(model.coef_)
                print(f"🔧 Inferred {n_features} features from coefficients")
        else:
            # Default assumption for spiral drawing features
            n_features = 20
            print(f"⚠️ Could not determine feature count, using default: {n_features}")
        
        # Create feature names based on spiral drawing characteristics
        if n_features <= 30:  # Reasonable number for spiral features
            feature_names = [
                'tremor_amplitude', 'tremor_frequency', 'drawing_speed',
                'spiral_tightness', 'line_smoothness', 'pressure_variation',
                'drawing_time', 'pen_lift_count', 'spiral_deviation',
                'stroke_length_mean', 'stroke_length_std', 'angular_velocity',
                'curvature_variation', 'spiral_radius_mean', 'spiral_radius_std',
                'drawing_consistency', 'motor_control_score', 'tremor_severity',
                'coordination_index', 'fluidity_measure'
            ][:n_features]
            
            # Fill remaining with generic names if needed
            while len(feature_names) < n_features:
                feature_names.append(f'spiral_feature_{len(feature_names)+1}')
                
        else:
            # Too many features - use generic names
            feature_names = [f'spiral_feature_{i+1}' for i in range(n_features)]
        
        # Save feature names
        joblib.dump(feature_names, "models/spiral_models/spiral_features.pkl")
        
        # Create identity scaler (assumes no preprocessing or minimal preprocessing)
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        scaler.mean_ = np.zeros(n_features)
        scaler.scale_ = np.ones(n_features)
        scaler.n_features_in_ = n_features
        
        joblib.dump(scaler, "models/spiral_models/spiral_scaler.pkl")
        
        print("✅ Spiral ML model setup complete!")
        print(f"   Model: {pkl_path}")
        print(f"   Features: {len(feature_names)} features")
        print(f"   Scaler: Identity (no preprocessing)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up spiral model: {str(e)}")
        return False

def verify_setup():
    """Verify all model files are in place"""
    
    print("\n🔍 Verifying model setup...")
    
    required_files = [
        "models/voice_models/parkinsons_xgboost_model.pkl",
        "models/voice_models/parkinsons_xgboost_model_scaler.pkl", 
        "models/voice_models/parkinsons_xgboost_model_features.pkl",
        "models/datscan_models/datscan_model.h5",
        "models/datscan_models/datscan_features.pkl",
        "models/datscan_models/datscan_scaler.pkl",
        "models/spiral_models/spiral_model.pkl",
        "models/spiral_models/spiral_features.pkl",
        "models/spiral_models/spiral_scaler.pkl"
    ]
    
    missing_files = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n⚠️ Missing {len(missing_files)} files. Place your model files and run again.")
        return False
    else:
        print("\n🎉 All model files are ready for late fusion!")
        return True

if __name__ == "__main__":
    print("🚀 Mixed Model Setup (H5 + PKL)")
    print("=" * 50)
    
    print("\n📋 INSTRUCTIONS:")
    print("1. Place datscan_model.h5 in: models/datscan_models/")
    print("2. Place spiral_model.pkl in: models/spiral_models/") 
    print("3. Run this script: python mixed_model_setup.py")
    
    # Check if files are placed
    datscan_exists = os.path.exists("models/datscan_models/datscan_model.h5")
    spiral_exists = os.path.exists("models/spiral_models/spiral_model.pkl")
    
    if not datscan_exists:
        print("\n❌ DATScan H5 model not found at: models/datscan_models/datscan_model.h5")
        print("   Please copy your teammate's .h5 file there first!")
    
    if not spiral_exists:
        print("\n❌ Spiral PKL model not found at: models/spiral_models/spiral_model.pkl")
        print("   Please copy your teammate's .pkl file there first!")
    
    if datscan_exists and spiral_exists:
        print("\n✅ Model files found! Setting up...")
        
        # Setup both models
        datscan_success = setup_datscan_dl_model()
        spiral_success = setup_spiral_ml_model()
        
        if datscan_success and spiral_success:
            verify_setup()
            print("\n🎉 Setup complete! Ready for late fusion integration.")
        else:
            print("\n❌ Setup incomplete. Check errors above.")
    
    print("\nNext steps:")
    print("1. Create model loaders for H5 and PKL models")
    print("2. Update main.py with new endpoints")
    print("3. Test individual models before fusion")