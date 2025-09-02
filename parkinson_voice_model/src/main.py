#!/usr/bin/env python3
"""
Main script for Parkinson's Disease Voice Detection using XGBoost
This script executes the complete pipeline from data loading to model training and evaluation.

Usage:
    python main.py

Author: Your Name
Date: September 2025
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Import custom modules
from config import Config
from data_loader import DatasetLoader
from feature_extractor import VoiceFeatureExtractor
from model_trainer import ParkinsonsModel

def main():
    """Main execution function"""
    
    print("="*70)
    print("PARKINSON'S DISEASE VOICE DETECTION USING XGBOOST")
    print("="*70)
    print(f"Started at: {datetime.now()}")
    print()
    
    # Initialize configuration
    config = Config()
    
    # Create necessary directories
    config.create_directories()
    
    # Step 1: Load datasets
    print("STEP 1: LOADING DATASETS")
    print("-" * 30)
    
    loader = DatasetLoader()
    file_df = loader.load_all_datasets()
    
    # Save file list
    file_list_path = loader.save_file_list(file_df, "complete_file_list.csv")
    
    print(f"Total files loaded: {len(file_df)}")
    print()
    
    # Step 2: Extract features
    print("STEP 2: FEATURE EXTRACTION")
    print("-" * 30)
    
    extractor = VoiceFeatureExtractor(
        sample_rate=config.SAMPLE_RATE,
        hop_length=config.HOP_LENGTH,
        n_mfcc=config.N_MFCC
    )
    
    # Check if features already exist
    features_path = os.path.join(config.PROCESSED_PATH, "extracted_features.csv")
    
    if os.path.exists(features_path):
        print(f"Loading existing features from: {features_path}")
        features_df = pd.read_csv(features_path)
        failed_files = []
    else:
        print("Extracting features from audio files...")
        features_df, failed_files = extractor.process_file_list(file_df)
        
        # Save features
        features_df.to_csv(features_path, index=False)
        print(f"Features saved to: {features_path}")
    
    print(f"Features extracted from {len(features_df)} files")
    if failed_files:
        print(f"Failed to process {len(failed_files)} files")
    print()
    
    # Step 3: Train model
    print("STEP 3: MODEL TRAINING")
    print("-" * 30)
    
    # Initialize model
    model = ParkinsonsModel()
    
    # Prepare features
    X, y = model.prepare_features(features_df)
    
    # Split data
    X_train, X_test, y_train, y_test = model.split_data(X, y)
    
    # Scale features
    X_train_scaled, X_test_scaled = model.scale_features(X_train, X_test)
    
    # Train model
    trained_model = model.train_model(X_train_scaled, y_train)
    
    print()
    
    # Step 4: Evaluate model
    print("STEP 4: MODEL EVALUATION")
    print("-" * 30)
    
    # Test set evaluation
    results = model.evaluate_model(X_test_scaled, y_test)
    
    # Cross-validation
    cv_scores = model.cross_validate(X_train_scaled, y_train, cv_folds=config.CV_FOLDS)
    
    # Feature importance
    feature_importance_df = model.get_feature_importance(top_n=15)
    
    print()
    
    # Step 5: Save model and results
    print("STEP 5: SAVING RESULTS")
    print("-" * 30)
    
    # Save model
    model_paths = model.save_model("parkinsons_xgboost_model")
    
    # Save feature importance
    importance_path = os.path.join(config.PROCESSED_PATH, "feature_importance.csv")
    feature_importance_df.to_csv(importance_path, index=False)
    print(f"Feature importance saved to: {importance_path}")
    
    # Save evaluation results
    results_summary = {
        'timestamp': datetime.now().isoformat(),
        'total_samples': len(features_df),
        'training_samples': len(X_train),
        'test_samples': len(X_test),
        'test_accuracy': results['accuracy'],
        'test_auc': results['auc_score'],
        'cv_mean_accuracy': cv_scores.mean(),
        'cv_std_accuracy': cv_scores.std(),
        'failed_files': len(failed_files) if failed_files else 0,
        'model_params': config.XGBOOST_PARAMS
    }
    
    results_path = os.path.join(config.PROCESSED_PATH, "model_results.csv")
    pd.DataFrame([results_summary]).to_csv(results_path, index=False)
    print(f"Results summary saved to: {results_path}")
    
    # Generate plots
    try:
        print("\nGenerating visualizations...")
        
        # Confusion matrix
        cm_path = os.path.join(config.PROCESSED_PATH, "confusion_matrix.png")
        model.plot_confusion_matrix(y_test, results['y_pred'], save_path=cm_path)
        
        # Feature importance plot
        fi_path = os.path.join(config.PROCESSED_PATH, "feature_importance.png")
        model.plot_feature_importance(top_n=15, save_path=fi_path)
        
        print(f"Plots saved to: {config.PROCESSED_PATH}")
        
    except Exception as e:
        print(f"Warning: Could not generate plots: {str(e)}")
        print("This is normal if running in a headless environment.")
    
    print()
    
    # Final summary
    print("="*70)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("="*70)
    print(f"Final Model Performance:")
    print(f"  Test Accuracy: {results['accuracy']:.4f}")
    print(f"  Test AUC: {results['auc_score']:.4f}")
    print(f"  CV Accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print()
    print("Model ready for multimodal fusion!")
    print(f"Completed at: {datetime.now()}")
    print("="*70)
    
    return model, results, features_df

def test_single_prediction():
    """Test prediction on a single file"""
    print("\n" + "="*50)
    print("TESTING SINGLE FILE PREDICTION")
    print("="*50)
    
    # Load trained model
    model = ParkinsonsModel()
    try:
        model.load_model("parkinsons_xgboost_model")
        print("Model loaded successfully!")
        
        # Create feature extractor
        extractor = VoiceFeatureExtractor()
        
        # Test on first file from dataset (if available)
        config = Config()
        file_list_path = os.path.join(config.PROCESSED_PATH, "complete_file_list.csv")
        
        if os.path.exists(file_list_path):
            file_df = pd.read_csv(file_list_path)
            test_file = file_df.iloc[0]['file_path']
            
            print(f"Testing on: {test_file}")
            
            if os.path.exists(test_file):
                result, features = model.predict_single_file(test_file, extractor)
                
                if result:
                    print(f"Prediction: {'PD' if result['prediction'] == 1 else 'Healthy'}")
                    print(f"Confidence: {result['confidence']:.4f}")
                    print(f"PD Probability: {result['probability_pd']:.4f}")
                    print(f"Healthy Probability: {result['probability_healthy']:.4f}")
                else:
                    print("Failed to process file")
            else:
                print(f"Test file not found: {test_file}")
        else:
            print("No file list found. Please run main() first.")
        
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        print("Please train the model first by running main()")

def show_fusion_example():
    """Show example of how to use late fusion"""
    print("\n" + "="*50)
    print("LATE FUSION EXAMPLE")
    print("="*50)
    
    print("Example code for multimodal fusion:")
    print("""
from late_fusion import MultimodalFusion, VoiceModelPredictor

# Initialize fusion system
fusion = MultimodalFusion(fusion_method='weighted_average')

# Load voice model predictions
voice_predictor = VoiceModelPredictor()
voice_probs = voice_predictor.predict_from_features(features_df)

# Combine with other modalities (replace with actual predictions)
text_probs = get_text_model_predictions()      # Your text model
datscan_probs = get_datscan_predictions()      # Your DATscan model

# Perform late fusion
final_predictions, final_probs = fusion.fuse_predictions(
    voice_probs, text_probs, datscan_probs
)

# Optimize fusion weights
best_weights, best_accuracy = fusion.optimize_weights(
    y_true, voice_probs, text_probs, datscan_probs
)
    """)

if __name__ == "__main__":
    try:
        # Check if model already exists
        config = Config()
        model_path = os.path.join(config.MODELS_PATH, "parkinsons_xgboost_model.pkl")
        
        if os.path.exists(model_path):
            print("Trained model found!")
            response = input("Do you want to retrain the model? (y/n): ")
            if response.lower() != 'y':
                test_single_prediction()
                show_fusion_example()
                sys.exit(0)
        
        # Run main training pipeline
        model, results, features_df = main()
        
        # Optional: Test single prediction
        print("\nWould you like to test a single file prediction?")
        response = input("Enter 'y' to test, any other key to exit: ")
        if response.lower() == 'y':
            test_single_prediction()
            
        # Show fusion example
        show_fusion_example()
            
    except KeyboardInterrupt:
        print("\n\nTraining interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\nError occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)