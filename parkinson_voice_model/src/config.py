import os
import numpy as np
import pandas as pd
import librosa
import parselmouth
from parselmouth.praat import call
import warnings
warnings.filterwarnings('ignore')

class Config:
    """Configuration settings for the project"""
    
    # Get the src directory path
    SRC_DIR = os.path.dirname(os.path.abspath(__file__))
    # Get the project root directory (parent of src)
    PROJECT_ROOT = os.path.dirname(SRC_DIR)
    
    # Dataset paths
    DATASET_ROOT = os.path.join(PROJECT_ROOT, "dataset")
    A_SOUND_PATH = os.path.join(DATASET_ROOT, "a_sound_dataset")
    ITALIAN_PATH = os.path.join(DATASET_ROOT, "italian_dataset")
    PROCESSED_PATH = os.path.join(DATASET_ROOT, "processed")
    
    # Models path
    MODELS_PATH = os.path.join(PROJECT_ROOT, "models")
    
    # Audio processing settings
    SAMPLE_RATE = 16000
    HOP_LENGTH = 512
    N_MFCC = 13
    N_FFT = 2048
    
    # Model settings
    TEST_SIZE = 0.2
    RANDOM_STATE = 42
    CV_FOLDS = 5
    
    # XGBoost parameters
    XGBOOST_PARAMS = {
        'n_estimators': 100,
        'max_depth': 4,
        'learning_rate': 0.1,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'random_state': RANDOM_STATE,
        'eval_metric': 'logloss'
    }
    
    # Feature categories
    VOICE_FEATURES = [
        'jitter_percent', 'jitter_abs', 'shimmer_percent', 'shimmer_abs',
        'hnr', 'pitch_mean', 'pitch_std', 'pitch_min', 'pitch_max',
        'formant_f1_mean', 'formant_f1_std', 'formant_f2_mean', 'formant_f2_std',
        'spectral_centroid_mean', 'spectral_centroid_std',
        'spectral_rolloff_mean', 'spectral_rolloff_std',
        'zero_crossing_rate_mean', 'zero_crossing_rate_std'
    ]
    
    MFCC_FEATURES = [f'mfcc_{i}' for i in range(1, N_MFCC + 1)]
    
    @classmethod
    def get_all_features(cls):
        """Get all feature names"""
        return cls.VOICE_FEATURES + cls.MFCC_FEATURES + ['source_dataset']
    
    @classmethod
    def create_directories(cls):
        """Create necessary directories"""
        os.makedirs(cls.PROCESSED_PATH, exist_ok=True)
        os.makedirs(cls.MODELS_PATH, exist_ok=True)
        print(f"✅ Created directories: {cls.PROCESSED_PATH}, {cls.MODELS_PATH}")

if __name__ == "__main__":
    config = Config()
    config.create_directories()
    print(f"Dataset path: {config.DATASET_ROOT}")
    print(f"Models path: {config.MODELS_PATH}")
    print(f"Processed path: {config.PROCESSED_PATH}")