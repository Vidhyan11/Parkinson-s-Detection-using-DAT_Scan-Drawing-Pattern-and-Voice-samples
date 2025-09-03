# Simple Test Script - Save as test_models.py
# Run in D:\Parkinson\backend directory

print("🚀 Starting Model Tests...")
print("=" * 50)

# Test 1: Basic imports
try:
    import sys
    import os
    print("✅ Basic imports OK")
except Exception as e:
    print(f"❌ Basic imports failed: {e}")
    exit(1)

# Test 2: Check directory structure
print("\n📁 Checking directory structure...")
if os.path.exists("models"):
    print("✅ models/ directory exists")
    
    # Check subdirectories
    for subdir in ["voice_models", "datscan_models", "spiral_models"]:
        path = f"models/{subdir}"
        if os.path.exists(path):
            print(f"✅ {path}/ exists")
            files = os.listdir(path)
            print(f"   Files: {files}")
        else:
            print(f"❌ {path}/ missing")
else:
    print("❌ models/ directory missing")

# Test 3: Try importing voice model
print("\n🎤 Testing Voice Model Import...")
try:
    sys.path.append('.')
    from utils.model_loader import ModelLoader
    print("✅ Voice ModelLoader imported")
    
    voice_loader = ModelLoader()
    print("✅ Voice ModelLoader instantiated")
    
    # Try loading
    success = voice_loader.load_model()
    if success:
        print("✅ Voice model loaded successfully!")
    else:
        print("❌ Voice model loading failed")
        
except Exception as e:
    print(f"❌ Voice model error: {e}")

# Test 4: Check if other model files exist
print("\n🔍 Checking model files...")

required_files = {
    "Voice": [
        "models/voice_models/parkinsons_xgboost_model.pkl",
        "models/voice_models/parkinsons_xgboost_model_scaler.pkl", 
        "models/voice_models/parkinsons_xgboost_model_features.pkl"
    ],
    "DATScan": [
        "models/datscan_models/datscan_model.h5",
    ],
    "Spiral": [
        "models/spiral_models/spiral_model.pkl",
    ]
}

for model_type, files in required_files.items():
    print(f"\n{model_type} Model Files:")
    for file_path in files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"  ✅ {file_path} ({size} bytes)")
        else:
            print(f"  ❌ {file_path} - MISSING")

print("\n" + "=" * 50)
print("Model test completed!")
print("\nNext steps:")
print("1. If voice model works, create other model loaders")
print("2. Place your teammate's model files in the right directories")
print("3. Test each model individually")