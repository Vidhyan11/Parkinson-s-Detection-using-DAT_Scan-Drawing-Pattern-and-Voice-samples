#!/usr/bin/env python3
"""
Single File Prediction Script for Parkinson's Voice Detection
Tests the trained model on a single audio file

Usage:
    python test_single_file.py path/to/audio/file.wav

Author: Your Name
Date: September 2025
"""

import os
import sys
import pandas as pd
import numpy as np
from config import Config
from model_trainer import ParkinsonsModel
from feature_extractor import VoiceFeatureExtractor

def predict_single_file(audio_file_path):
    """
    Predict Parkinson's disease from a single audio file
    
    Args:
        audio_file_path: Path to the .wav audio file
    
    Returns:
        Dictionary with prediction results
    """
    
    print("="*60)
    print("SINGLE FILE PARKINSON'S DETECTION")
    print("="*60)
    
    # Check if file exists
    if not os.path.exists(audio_file_path):
        print(f"❌ Error: File not found - {audio_file_path}")
        return None
    
    print(f"Testing file: {os.path.basename(audio_file_path)}")
    print(f"Full path: {audio_file_path}")
    
    # Load trained model
    print("\n1. Loading trained model...")
    try:
        model = ParkinsonsModel()
        model.load_model("parkinsons_xgboost_model")
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {str(e)}")
        print("Please ensure the model is trained by running main.py first")
        return None
    
    # Extract features from audio file
    print("\n2. Extracting voice features...")
    try:
        extractor = VoiceFeatureExtractor()
        features = extractor.extract_all_features(audio_file_path)
        
        if features is None:
            print("❌ Failed to extract features from audio file")
            return None
            
        print(f"✅ Extracted {len(features)} features")
        print("Sample features:", list(features.keys())[:5])
        
    except Exception as e:
        print(f"❌ Error extracting features: {str(e)}")
        return None
    
    # Prepare features for prediction
    print("\n3. Preparing features for prediction...")
    try:
        # Convert to DataFrame
        features_df = pd.DataFrame([features])
        
        # Prepare features using the same method as training
        feature_columns = [col for col in features_df.columns 
                          if col not in ['label', 'file_path', 'file_name', 'subject_group']]
        
        X = features_df[feature_columns].copy()
        
        # Handle categorical features
        from sklearn.preprocessing import LabelEncoder
        categorical_cols = X.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col in X.columns:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
        
        # Handle missing and infinite values
        X = X.fillna(0)
        X = X.replace([np.inf, -np.inf], 0)
        
        print("✅ Features prepared successfully")
        
    except Exception as e:
        print(f"❌ Error preparing features: {str(e)}")
        return None
    
    # Make prediction
    print("\n4. Making prediction...")
    try:
        # Scale features and predict
        X_scaled = model.scaler.transform(X)
        prediction = model.model.predict(X_scaled)[0]
        probabilities = model.model.predict_proba(X_scaled)[0]
        
        # Create result dictionary
        result = {
            'file_path': audio_file_path,
            'file_name': os.path.basename(audio_file_path),
            'prediction': int(prediction),
            'prediction_label': 'Parkinson\'s Disease' if prediction == 1 else 'Healthy',
            'probability_healthy': float(probabilities[0]),
            'probability_pd': float(probabilities[1]),
            'confidence': float(max(probabilities)),
            'confidence_percentage': f"{max(probabilities)*100:.1f}%"
        }
        
        print("✅ Prediction completed!")
        
    except Exception as e:
        print(f"❌ Error making prediction: {str(e)}")
        return None
    
    # Display results
    print("\n" + "="*60)
    print("PREDICTION RESULTS")
    print("="*60)
    print(f"File: {result['file_name']}")
    print(f"Prediction: {result['prediction_label']}")
    print(f"Confidence: {result['confidence_percentage']}")
    print()
    print("Detailed Probabilities:")
    print(f"  Healthy: {result['probability_healthy']:.4f} ({result['probability_healthy']*100:.1f}%)")
    print(f"  Parkinson's: {result['probability_pd']:.4f} ({result['probability_pd']*100:.1f}%)")
    print()
    
    # Interpretation
    if result['confidence'] > 0.8:
        confidence_level = "High"
    elif result['confidence'] > 0.6:
        confidence_level = "Medium"
    else:
        confidence_level = "Low"
    
    print(f"Confidence Level: {confidence_level}")
    
    if result['prediction'] == 1:
        print("⚠️  The model suggests potential signs of Parkinson's disease.")
        print("   This should be confirmed by medical professionals.")
    else:
        print("✅ The model suggests the voice sample appears healthy.")
        print("   Regular monitoring is still recommended.")
    
    print("\nNote: This is an AI prediction and should not replace professional medical diagnosis.")
    print("="*60)
    
    return result

def main():
    """Main function for command line usage"""
    
    if len(sys.argv) != 2:
        print("Usage: python test_single_file.py <audio_file_path>")
        print("Example: python test_single_file.py sample_voice.wav")
        return
    
    audio_file = sys.argv[1]
    result = predict_single_file(audio_file)
    
    if result:
        # Optionally save results to file
        config = Config()
        results_file = os.path.join(config.PROCESSED_PATH, "single_prediction_results.csv")
        
        # Save to CSV
        results_df = pd.DataFrame([result])
        results_df.to_csv(results_file, index=False)
        print(f"\nResults saved to: {results_file}")

def test_with_existing_file():
    """Test with a file from the dataset"""
    
    config = Config()
    
    # Try to find a test file from the dataset
    test_files = []
    
    # Check A-sound dataset
    hc_path = os.path.join(config.A_SOUND_PATH, "HC_AH")
    if os.path.exists(hc_path):
        import glob
        wav_files = glob.glob(os.path.join(hc_path, "*.wav"))
        if wav_files:
            test_files.extend(wav_files[:2])  # Take first 2 files
    
    # Check Italian dataset
    processed_file = os.path.join(config.PROCESSED_PATH, "complete_file_list.csv")
    if os.path.exists(processed_file):
        df = pd.read_csv(processed_file)
        if len(df) > 0:
            # Take one healthy and one PD sample if available
            healthy_samples = df[df['label'] == 0]['file_path'].head(1).tolist()
            pd_samples = df[df['label'] == 1]['file_path'].head(1).tolist()
            test_files.extend(healthy_samples + pd_samples)
    
    if not test_files:
        print("No test files found in dataset")
        return
    
    # Test each file
    for i, test_file in enumerate(test_files[:3]):  # Test max 3 files
        print(f"\n{'='*20} TEST {i+1} {'='*20}")
        if os.path.exists(test_file):
            result = predict_single_file(test_file)
        else:
            print(f"File not found: {test_file}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        main()
    else:
        print("No file specified. Testing with dataset files...")
        test_with_existing_file()