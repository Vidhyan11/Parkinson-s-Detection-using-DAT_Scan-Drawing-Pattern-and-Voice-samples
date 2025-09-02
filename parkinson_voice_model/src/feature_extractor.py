import numpy as np
import pandas as pd
import librosa
import parselmouth
from parselmouth.praat import call
import warnings
warnings.filterwarnings('ignore')

class VoiceFeatureExtractor:
    """Extracts comprehensive voice features from audio files"""
    
    def __init__(self, sample_rate=16000, hop_length=512, n_mfcc=13):
        self.sample_rate = sample_rate
        self.hop_length = hop_length
        self.n_mfcc = n_mfcc
        
    def load_audio(self, file_path):
        """Load and preprocess audio file"""
        try:
            # Load audio with librosa
            y, sr = librosa.load(file_path, sr=self.sample_rate)
            
            # Remove silence
            y_trimmed, _ = librosa.effects.trim(y, top_db=20)
            
            # Normalize
            y_normalized = librosa.util.normalize(y_trimmed)
            
            return y_normalized, sr
        except Exception as e:
            print(f"Error loading {file_path}: {str(e)}")
            return None, None
    
    def extract_praat_features(self, file_path):
        """Extract features using Praat/Parselmouth"""
        features = {}
        
        try:
            # Load sound with parselmouth
            sound = parselmouth.Sound(file_path)
            
            # Pitch analysis
            pitch = sound.to_pitch()
            pitch_values = pitch.selected_array['frequency']
            pitch_values = pitch_values[pitch_values != 0]  # Remove unvoiced frames
            
            if len(pitch_values) > 0:
                features['pitch_mean'] = np.mean(pitch_values)
                features['pitch_std'] = np.std(pitch_values)
                features['pitch_min'] = np.min(pitch_values)
                features['pitch_max'] = np.max(pitch_values)
            else:
                features['pitch_mean'] = 0
                features['pitch_std'] = 0
                features['pitch_min'] = 0
                features['pitch_max'] = 0
            
            # Jitter and Shimmer
            point_process = call(sound, "To PointProcess (periodic, cc)", 75, 600)
            
            # Jitter
            try:
                jitter_local = call(point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
                jitter_local_abs = call(point_process, "Get jitter (local, absolute)", 0, 0, 0.0001, 0.02, 1.3)
                features['jitter_percent'] = jitter_local * 100 if not np.isnan(jitter_local) else 0
                features['jitter_abs'] = jitter_local_abs if not np.isnan(jitter_local_abs) else 0
            except:
                features['jitter_percent'] = 0
                features['jitter_abs'] = 0
            
            # Shimmer
            try:
                shimmer_local = call([sound, point_process], "Get shimmer (local)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
                shimmer_local_abs = call([sound, point_process], "Get shimmer (local_dB)", 0, 0, 0.0001, 0.02, 1.3, 1.6)
                features['shimmer_percent'] = shimmer_local * 100 if not np.isnan(shimmer_local) else 0
                features['shimmer_abs'] = shimmer_local_abs if not np.isnan(shimmer_local_abs) else 0
            except:
                features['shimmer_percent'] = 0
                features['shimmer_abs'] = 0
            
            # Harmonics-to-Noise Ratio (HNR)
            try:
                harmonicity = sound.to_harmonicity()
                hnr = call(harmonicity, "Get mean", 0, 0)
                features['hnr'] = hnr if not np.isnan(hnr) else 0
            except:
                features['hnr'] = 0
            
            # Formant analysis
            try:
                formant = sound.to_formant_burg()
                
                # Get F1 and F2 values
                f1_values = []
                f2_values = []
                
                duration = sound.get_total_duration()
                time_step = duration / 50  # Sample at 50 points to avoid too much computation
                
                for i in range(50):
                    time_point = i * time_step
                    try:
                        f1 = call(formant, "Get value at time", 1, time_point, "Hertz", "Linear")
                        f2 = call(formant, "Get value at time", 2, time_point, "Hertz", "Linear")
                        
                        if not np.isnan(f1) and f1 > 0:
                            f1_values.append(f1)
                        if not np.isnan(f2) and f2 > 0:
                            f2_values.append(f2)
                    except:
                        continue
                
                if f1_values:
                    features['formant_f1_mean'] = np.mean(f1_values)
                    features['formant_f1_std'] = np.std(f1_values)
                else:
                    features['formant_f1_mean'] = 0
                    features['formant_f1_std'] = 0
                    
                if f2_values:
                    features['formant_f2_mean'] = np.mean(f2_values)
                    features['formant_f2_std'] = np.std(f2_values)
                else:
                    features['formant_f2_mean'] = 0
                    features['formant_f2_std'] = 0
            except:
                features['formant_f1_mean'] = 0
                features['formant_f1_std'] = 0
                features['formant_f2_mean'] = 0
                features['formant_f2_std'] = 0
            
        except Exception as e:
            print(f"Error extracting Praat features from {file_path}: {str(e)}")
            # Return default values
            default_features = [
                'jitter_percent', 'jitter_abs', 'shimmer_percent', 'shimmer_abs',
                'hnr', 'pitch_mean', 'pitch_std', 'pitch_min', 'pitch_max',
                'formant_f1_mean', 'formant_f1_std', 'formant_f2_mean', 'formant_f2_std'
            ]
            for feature in default_features:
                if feature not in features:
                    features[feature] = 0
        
        return features
    
    def extract_librosa_features(self, y, sr):
        """Extract features using librosa"""
        features = {}
        
        try:
            # MFCCs
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=self.n_mfcc, hop_length=self.hop_length)
            for i in range(self.n_mfcc):
                features[f'mfcc_{i+1}'] = np.mean(mfccs[i])
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=self.hop_length)[0]
            features['spectral_centroid_mean'] = np.mean(spectral_centroids)
            features['spectral_centroid_std'] = np.std(spectral_centroids)
            
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, hop_length=self.hop_length)[0]
            features['spectral_rolloff_mean'] = np.mean(spectral_rolloff)
            features['spectral_rolloff_std'] = np.std(spectral_rolloff)
            
            zero_crossing_rate = librosa.feature.zero_crossing_rate(y, hop_length=self.hop_length)[0]
            features['zero_crossing_rate_mean'] = np.mean(zero_crossing_rate)
            features['zero_crossing_rate_std'] = np.std(zero_crossing_rate)
            
        except Exception as e:
            print(f"Error extracting librosa features: {str(e)}")
            # Return default values
            for i in range(self.n_mfcc):
                features[f'mfcc_{i+1}'] = 0
            features.update({
                'spectral_centroid_mean': 0, 'spectral_centroid_std': 0,
                'spectral_rolloff_mean': 0, 'spectral_rolloff_std': 0,
                'zero_crossing_rate_mean': 0, 'zero_crossing_rate_std': 0
            })
        
        return features
    
    def extract_all_features(self, file_path, audio_type='unknown', source_dataset='unknown'):
        """Extract all features from an audio file"""
        
        # Load audio
        y, sr = self.load_audio(file_path)
        if y is None:
            return None
        
        # Extract Praat features
        praat_features = self.extract_praat_features(file_path)
        
        # Extract librosa features
        librosa_features = self.extract_librosa_features(y, sr)
        
        # Combine all features
        all_features = {**praat_features, **librosa_features}
        
        # Add metadata
        all_features['audio_type'] = audio_type
        all_features['source_dataset'] = source_dataset
        all_features['file_path'] = file_path
        all_features['duration'] = len(y) / sr
        
        return all_features
    
    def process_file_list(self, file_df, save_progress=True):
        """Process a list of files and extract features"""
        from tqdm import tqdm
        
        print(f"Processing {len(file_df)} audio files...")
        
        features_list = []
        failed_files = []
        
        for idx, row in tqdm(file_df.iterrows(), total=len(file_df), desc="Extracting features"):
            try:
                features = self.extract_all_features(
                    file_path=row['file_path'],
                    audio_type=row['audio_type'],
                    source_dataset=row['source_dataset']
                )
                
                if features is not None:
                    # Add original labels and metadata
                    features['label'] = row['label']
                    features['subject_group'] = row['subject_group']
                    features['file_name'] = row['file_name']
                    
                    features_list.append(features)
                else:
                    failed_files.append(row['file_path'])
                    
            except Exception as e:
                print(f"Failed to process {row['file_path']}: {str(e)}")
                failed_files.append(row['file_path'])
        
        print(f"\nSuccessfully processed: {len(features_list)} files")
        print(f"Failed to process: {len(failed_files)} files")
        
        if failed_files:
            print("Failed files:")
            for f in failed_files[:5]:  # Show first 5 failed files
                print(f"  {f}")
        
        # Convert to DataFrame
        features_df = pd.DataFrame(features_list)
        
        return features_df, failed_files

if __name__ == "__main__":
    # Test feature extraction
    import os
    extractor = VoiceFeatureExtractor()
    
    # Test on a single file (replace with actual path)
    test_file = "path/to/test/file.wav"  # You'll need to update this
    if os.path.exists(test_file):
        features = extractor.extract_all_features(test_file)
        print("Extracted features:", list(features.keys()))