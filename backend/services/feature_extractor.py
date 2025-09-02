import numpy as np
import pandas as pd
import librosa
import warnings
import logging
from typing import Dict, Any, Optional, Tuple
import tempfile
import os
import base64
import io
import soundfile as sf
from pydub import AudioSegment

warnings.filterwarnings('ignore')
logger = logging.getLogger(__name__)

class VoiceFeatureExtractor:
    """Extracts comprehensive voice features from audio files using librosa"""
    
    def __init__(self, sample_rate=16000, hop_length=512, n_mfcc=13):
        self.sample_rate = sample_rate
        self.hop_length = hop_length
        self.n_mfcc = n_mfcc
        
    def load_audio(self, file_path: str) -> Tuple[Optional[np.ndarray], Optional[int]]:
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
            logger.error(f"Error loading {file_path}: {str(e)}")
            return None, None
    
    def load_audio_from_base64(self, audio_data: str) -> Tuple[Optional[np.ndarray], Optional[int]]:
        """Load audio from base64 encoded data"""
        try:
            # Decode base64 data
            audio_bytes = base64.b64decode(audio_data)
            
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            try:
                # Load audio
                y, sr = librosa.load(temp_path, sr=self.sample_rate)
                
                # Remove silence
                y_trimmed, _ = librosa.effects.trim(y, top_db=20)
                
                # Normalize
                y_normalized = librosa.util.normalize(y_trimmed)
                
                return y_normalized, sr
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
                    
        except Exception as e:
            logger.error(f"Error loading audio from base64: {str(e)}")
            return None, None
    
    def extract_librosa_features(self, y: np.ndarray, sr: int) -> Dict[str, float]:
        """Extract features using librosa"""
        features = {}
        
        try:
            # Duration
            duration = librosa.get_duration(y=y, sr=sr)
            features['duration'] = duration
            
            # Pitch (fundamental frequency) using librosa
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr, hop_length=self.hop_length)
            pitch_values = pitches[magnitudes > np.percentile(magnitudes, 85)]
            pitch_values = pitch_values[pitch_values > 0]  # Remove zero frequencies
            
            if len(pitch_values) > 0:
                features['pitch_mean'] = float(np.mean(pitch_values))
                features['pitch_std'] = float(np.std(pitch_values))
                features['pitch_min'] = float(np.min(pitch_values))
                features['pitch_max'] = float(np.max(pitch_values))
            else:
                features['pitch_mean'] = 0.0
                features['pitch_std'] = 0.0
                features['pitch_min'] = 0.0
                features['pitch_max'] = 0.0
            
            # Jitter (pitch variation) - simplified version
            if len(pitch_values) > 1:
                pitch_diffs = np.diff(pitch_values)
                features['jitter_percent'] = float(np.std(pitch_diffs) / np.mean(pitch_values) * 100)
                features['jitter_abs'] = float(np.std(pitch_diffs))
            else:
                features['jitter_percent'] = 0.0
                features['jitter_abs'] = 0.0
            
            # Shimmer (amplitude variation) - simplified version
            frame_length = int(0.025 * sr)  # 25ms frames
            hop_length = int(0.010 * sr)    # 10ms hop
            
            # Calculate RMS energy for each frame
            rms_energy = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
            
            if len(rms_energy) > 1:
                rms_diffs = np.diff(rms_energy)
                features['shimmer_percent'] = float(np.std(rms_diffs) / np.mean(rms_energy) * 100)
                features['shimmer_abs'] = float(np.std(rms_diffs))
            else:
                features['shimmer_percent'] = 0.0
                features['shimmer_abs'] = 0.0
            
            # Spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=self.hop_length)[0]
            features['spectral_centroid_mean'] = float(np.mean(spectral_centroids))
            features['spectral_centroid_std'] = float(np.std(spectral_centroids))
            
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr, hop_length=self.hop_length)[0]
            features['spectral_rolloff_mean'] = float(np.mean(spectral_rolloff))
            features['spectral_rolloff_std'] = float(np.std(spectral_rolloff))
            
            # MFCC features
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=self.n_mfcc, hop_length=self.hop_length)
            for i in range(self.n_mfcc):
                features[f'mfcc_{i+1}'] = float(np.mean(mfccs[i]))
            
            # Zero crossing rate
            zcr = librosa.feature.zero_crossing_rate(y, hop_length=self.hop_length)[0]
            features['zero_crossing_rate_mean'] = float(np.mean(zcr))
            features['zero_crossing_rate_std'] = float(np.std(zcr))
            
            # Harmonics-to-Noise Ratio (simplified)
            # Use spectral contrast as a proxy for HNR
            spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr, hop_length=self.hop_length)
            features['hnr'] = float(np.mean(spectral_contrast))
            
            # Formant-like features (simplified using spectral peaks)
            # Find peaks in the spectrum
            D = librosa.stft(y, hop_length=self.hop_length)
            S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)
            
            # Find spectral peaks (simplified formant detection)
            peaks = librosa.util.peak_pick(S_db, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
            
            if len(peaks) > 0:
                # Use first two peaks as formant-like features
                peak_freqs = librosa.fft_frequencies(sr=sr, hop_length=self.hop_length)
                formant_freqs = peak_freqs[peaks[1]] if len(peaks) > 1 else [0]
                
                if len(formant_freqs) > 0:
                    features['formant_f1_mean'] = float(np.mean(formant_freqs[:len(formant_freqs)//2]))
                    features['formant_f1_std'] = float(np.std(formant_freqs[:len(formant_freqs)//2]))
                    features['formant_f2_mean'] = float(np.mean(formant_freqs[len(formant_freqs)//2:]))
                    features['formant_f2_std'] = float(np.std(formant_freqs[len(formant_freqs)//2:]))
                else:
                    features['formant_f1_mean'] = 0.0
                    features['formant_f1_std'] = 0.0
                    features['formant_f2_mean'] = 0.0
                    features['formant_f2_std'] = 0.0
            else:
                features['formant_f1_mean'] = 0.0
                features['formant_f1_std'] = 0.0
                features['formant_f2_mean'] = 0.0
                features['formant_f2_std'] = 0.0
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting librosa features: {str(e)}")
            return {}
    
    def extract_all_features(self, file_path: str) -> Optional[Dict[str, float]]:
        """Extract all features from audio file"""
        try:
            # Load audio
            y, sr = self.load_audio(file_path)
            if y is None:
                return None
            
            # Extract features
            features = self.extract_librosa_features(y, sr)
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features from {file_path}: {str(e)}")
            return None
    
    def extract_features_from_base64(self, audio_data: str) -> Optional[Dict[str, float]]:
        """Extract features from base64 encoded audio"""
        try:
            # Load audio from base64
            y, sr = self.load_audio_from_base64(audio_data)
            if y is None:
                return None
            
            # Extract features
            features = self.extract_librosa_features(y, sr)
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting features from base64 audio: {str(e)}")
            return None
    
    def get_feature_descriptions(self) -> Dict[str, Dict[str, str]]:
        """Get descriptions of all voice features"""
        return {
            "pitch_features": {
                "pitch_mean": "Average fundamental frequency of the voice",
                "pitch_std": "Variability in fundamental frequency",
                "pitch_min": "Lowest fundamental frequency",
                "pitch_max": "Highest fundamental frequency"
            },
            "jitter_features": {
                "jitter_percent": "Cycle-to-cycle variation in fundamental frequency (percentage)",
                "jitter_abs": "Absolute jitter value in milliseconds"
            },
            "shimmer_features": {
                "shimmer_percent": "Cycle-to-cycle variation in amplitude (percentage)",
                "shimmer_abs": "Absolute shimmer value in decibels"
            },
            "spectral_features": {
                "spectral_centroid_mean": "Average brightness of the voice",
                "spectral_centroid_std": "Variability in voice brightness",
                "spectral_rolloff_mean": "Frequency below which 85% of energy is contained",
                "spectral_rolloff_std": "Variability in spectral rolloff"
            },
            "formant_features": {
                "formant_f1_mean": "Average first formant frequency",
                "formant_f1_std": "Variability in first formant",
                "formant_f2_mean": "Average second formant frequency",
                "formant_f2_std": "Variability in second formant"
            },
            "mfcc_features": {
                "mfcc_1": "First Mel-frequency cepstral coefficient",
                "mfcc_2": "Second Mel-frequency cepstral coefficient",
                "mfcc_3": "Third Mel-frequency cepstral coefficient",
                "mfcc_4": "Fourth Mel-frequency cepstral coefficient",
                "mfcc_5": "Fifth Mel-frequency cepstral coefficient",
                "mfcc_6": "Sixth Mel-frequency cepstral coefficient",
                "mfcc_7": "Seventh Mel-frequency cepstral coefficient",
                "mfcc_8": "Eighth Mel-frequency cepstral coefficient",
                "mfcc_9": "Ninth Mel-frequency cepstral coefficient",
                "mfcc_10": "Tenth Mel-frequency cepstral coefficient",
                "mfcc_11": "Eleventh Mel-frequency cepstral coefficient",
                "mfcc_12": "Twelfth Mel-frequency cepstral coefficient",
                "mfcc_13": "Thirteenth Mel-frequency cepstral coefficient"
            },
            "other_features": {
                "hnr": "Harmonics-to-Noise Ratio - measure of voice quality",
                "zero_crossing_rate_mean": "Average rate of sign changes in the signal",
                "zero_crossing_rate_std": "Variability in zero crossing rate"
            }
        }
