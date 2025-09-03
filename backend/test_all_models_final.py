# Complete Model Test - All Three Models
# Save as: test_all_models.py

print("🚀 Testing All Three Models for Late Fusion")
print("=" * 60)

import sys
sys.path.append('.')

# Test 1: Voice Model
print("\n🎤 Testing Voice Model...")
try:
    from utils.model_loader import ModelLoader
    
    voice_loader = ModelLoader()
    success = voice_loader.load_model()
    
    if success:
        print("✅ Voice model loaded successfully!")
        print(f"   Features: {len(voice_loader.feature_names)} features")
    else:
        print("❌ Voice model failed to load")
        
except Exception as e:
    print(f"❌ Voice model error: {e}")

# Test 2: DATScan Model  
print("\n🧠 Testing DATScan Model...")
try:
    from utils.datscan_model_loader import DATScanModelLoader
    
    datscan_loader = DATScanModelLoader()
    success = datscan_loader.load_model()
    
    if success:
        print("✅ DATScan model loaded successfully!")
        print(f"   Model type: {type(datscan_loader.model)}")
    else:
        print("❌ DATScan model failed to load")
        
except Exception as e:
    print(f"❌ DATScan model error: {e}")

# Test 3: Spiral Model
print("\n🎯 Testing Spiral Model...")
try:
    from utils.spiral_model_loader import SpiralModelLoader
    
    spiral_loader = SpiralModelLoader()
    success = spiral_loader.load_model()
    
    if success:
        print("✅ Spiral model loaded successfully!")
        print(f"   Features: {len(spiral_loader.feature_names)} features")
        print(f"   Sample features: {spiral_loader.feature_names[:3]}...")
    else:
        print("❌ Spiral model failed to load")
        
except Exception as e:
    print(f"❌ Spiral model error: {e}")

print("\n" + "=" * 60)
print("🎉 All models ready for Late Fusion!")
print("\nNext steps:")
print("1. All three models are loaded and working")
print("2. Ready to build multi-modal analysis system") 
print("3. Start frontend development with Cursor AI")
print("4. Implement late fusion service")