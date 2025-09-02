#!/usr/bin/env python3
"""
Late Fusion Module for Multimodal Parkinson's Disease Detection
Combines predictions from voice, text, and DATscan models

Usage:
    from late_fusion import MultimodalFusion
    fusion = MultimodalFusion()
    final_prediction = fusion.fuse_predictions(voice_probs, text_probs, datscan_probs)

Author: Your Name
Date: September 2025
"""

import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
import joblib
from config import Config

class MultimodalFusion:
    """Handles late fusion of multimodal predictions"""
    
    def __init__(self, fusion_method='weighted_average'):
        """
        Initialize fusion module
        
        Args:
            fusion_method: str, one of ['simple_average', 'weighted_average', 'voting']
        """
        self.fusion_method = fusion_method
        self.weights = None
        self.config = Config()
        
        # Default weights (can be optimized)
        self.default_weights = {
            'voice': 0.4,
            'text': 0.3,
            'datscan': 0.3
        }
    
    def simple_average_fusion(self, voice_probs, text_probs, datscan_probs):
        """Simple averaging of probabilities"""
        combined_probs = (voice_probs + text_probs + datscan_probs) / 3
        predictions = (combined_probs[:, 1] > 0.5).astype(int)
        return predictions, combined_probs
    
    def weighted_average_fusion(self, voice_probs, text_probs, datscan_probs, weights=None):
        """Weighted averaging of probabilities"""
        if weights is None:
            weights = self.default_weights
        
        # Normalize weights
        total_weight = sum(weights.values())
        normalized_weights = {k: v/total_weight for k, v in weights.items()}
        
        combined_probs = (
            normalized_weights['voice'] * voice_probs +
            normalized_weights['text'] * text_probs +
            normalized_weights['datscan'] * datscan_probs
        )
        
        predictions = (combined_probs[:, 1] > 0.5).astype(int)
        return predictions, combined_probs
    
    def voting_fusion(self, voice_probs, text_probs, datscan_probs):
        """Majority voting fusion"""
        voice_preds = (voice_probs[:, 1] > 0.5).astype(int)
        text_preds = (text_probs[:, 1] > 0.5).astype(int)
        datscan_preds = (datscan_probs[:, 1] > 0.5).astype(int)
        
        # Majority voting
        votes = voice_preds + text_preds + datscan_preds
        predictions = (votes >= 2).astype(int)
        
        # For probabilities, use average
        combined_probs = (voice_probs + text_probs + datscan_probs) / 3
        
        return predictions, combined_probs
    
    def fuse_predictions(self, voice_probs, text_probs, datscan_probs, weights=None):
        """
        Main fusion function
        
        Args:
            voice_probs: array of shape (n_samples, 2) - voice model probabilities
            text_probs: array of shape (n_samples, 2) - text model probabilities  
            datscan_probs: array of shape (n_samples, 2) - datscan model probabilities
            weights: dict - custom weights for weighted averaging
            
        Returns:
            predictions: array of final predictions (0/1)
            probabilities: array of final probabilities
        """
        
        # Convert to numpy arrays if needed
        voice_probs = np.array(voice_probs)
        text_probs = np.array(text_probs) 
        datscan_probs = np.array(datscan_probs)
        
        # Ensure proper shape
        if voice_probs.ndim == 1:
            voice_probs = np.column_stack([1-voice_probs, voice_probs])
        if text_probs.ndim == 1:
            text_probs = np.column_stack([1-text_probs, text_probs])
        if datscan_probs.ndim == 1:
            datscan_probs = np.column_stack([1-datscan_probs, datscan_probs])
        
        if self.fusion_method == 'simple_average':
            return self.simple_average_fusion(voice_probs, text_probs, datscan_probs)
        
        elif self.fusion_method == 'weighted_average':
            return self.weighted_average_fusion(voice_probs, text_probs, datscan_probs, weights)
        
        elif self.fusion_method == 'voting':
            return self.voting_fusion(voice_probs, text_probs, datscan_probs)
        
        else:
            raise ValueError(f"Unknown fusion method: {self.fusion_method}")
    
    def evaluate_fusion(self, y_true, voice_probs, text_probs, datscan_probs, weights=None):
        """Evaluate fusion performance"""
        
        predictions, probabilities = self.fuse_predictions(
            voice_probs, text_probs, datscan_probs, weights
        )
        
        accuracy = accuracy_score(y_true, predictions)
        report = classification_report(y_true, predictions, target_names=['Healthy', 'PD'], output_dict=True)
        
        results = {
            'accuracy': accuracy,
            'classification_report': report,
            'predictions': predictions,
            'probabilities': probabilities
        }
        
        return results
    
    def optimize_weights(self, y_true, voice_probs, text_probs, datscan_probs, 
                        weight_ranges=None, n_trials=100):
        """
        Optimize fusion weights using grid search
        
        Args:
            y_true: true labels
            voice_probs, text_probs, datscan_probs: model probabilities
            weight_ranges: dict with ranges for each modality
            n_trials: number of random trials
        """
        
        if weight_ranges is None:
            weight_ranges = {
                'voice': (0.2, 0.6),
                'text': (0.1, 0.5),
                'datscan': (0.1, 0.5)
            }
        
        best_accuracy = 0
        best_weights = None
        
        print(f"Optimizing weights with {n_trials} trials...")
        
        for trial in range(n_trials):
            # Generate random weights
            weights = {}
            for modality, (min_w, max_w) in weight_ranges.items():
                weights[modality] = np.random.uniform(min_w, max_w)
            
            # Evaluate with these weights
            results = self.evaluate_fusion(y_true, voice_probs, text_probs, datscan_probs, weights)
            
            if results['accuracy'] > best_accuracy:
                best_accuracy = results['accuracy']
                best_weights = weights.copy()
        
        print(f"Best accuracy: {best_accuracy:.4f}")
        print(f"Best weights: {best_weights}")
        
        self.weights = best_weights
        return best_weights, best_accuracy

class VoiceModelPredictor:
    """Helper class to make predictions using trained voice model"""
    
    def __init__(self, model_name="parkinsons_voice_model"):
        self.config = Config()
        self.model_name = model_name
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.load_model()
    
    def load_model(self):
        """Load the trained voice model"""
        from model_trainer import ParkinsonsModel
        
        model_trainer = ParkinsonsModel()
        try:
            model_trainer.load_model(self.model_name)
            self.model = model_trainer.model
            self.scaler = model_trainer.scaler
            self.feature_names = model_trainer.feature_names
            print(f"Voice model loaded successfully!")
        except Exception as e:
            print(f"Error loading voice model: {str(e)}")
            raise
    
    def predict_from_features(self, features_df):
        """Make predictions from extracted features"""
        if self.model is None:
            raise ValueError("Model not loaded!")
        
        # Prepare features (similar to model_trainer)
        feature_columns = [col for col in features_df.columns 
                          if col not in ['label', 'file_path', 'file_name', 'subject_group']]
        
        X = features_df[feature_columns].copy()
        
        # Handle categorical features
        categorical_cols = X.select_dtypes(include=['object']).columns
        from sklearn.preprocessing import LabelEncoder
        for col in categorical_cols:
            if col in X.columns:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
        
        # Handle missing and infinite values
        X = X.fillna(0)
        X = X.replace([np.inf, -np.inf], 0)
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Make predictions
        probabilities = self.model.predict_proba(X_scaled)
        
        return probabilities

def demo_fusion():
    """Demo function showing how to use the fusion module"""
    
    print("="*50)
    print("MULTIMODAL FUSION DEMO")
    print("="*50)
    
    # Simulate some predictions (replace with actual model outputs)
    n_samples = 100
    
    # Simulate voice model predictions (higher accuracy for PD detection)
    voice_probs = np.random.rand(n_samples, 2)
    voice_probs = voice_probs / voice_probs.sum(axis=1, keepdims=True)
    
    # Simulate text model predictions
    text_probs = np.random.rand(n_samples, 2)
    text_probs = text_probs / text_probs.sum(axis=1, keepdims=True)
    
    # Simulate DATscan predictions (very reliable)
    datscan_probs = np.random.rand(n_samples, 2)
    datscan_probs = datscan_probs / datscan_probs.sum(axis=1, keepdims=True)
    
    # Create ground truth
    y_true = np.random.randint(0, 2, n_samples)
    
    # Initialize fusion
    fusion = MultimodalFusion(fusion_method='weighted_average')
    
    # Test different fusion methods
    methods = ['simple_average', 'weighted_average', 'voting']
    
    for method in methods:
        fusion.fusion_method = method
        results = fusion.evaluate_fusion(y_true, voice_probs, text_probs, datscan_probs)
        print(f"\n{method.upper()} FUSION:")
        print(f"Accuracy: {results['accuracy']:.4f}")
    
    # Optimize weights
    print(f"\nOPTIMIZING WEIGHTS:")
    best_weights, best_acc = fusion.optimize_weights(y_true, voice_probs, text_probs, datscan_probs)

if __name__ == "__main__":
    demo_fusion()