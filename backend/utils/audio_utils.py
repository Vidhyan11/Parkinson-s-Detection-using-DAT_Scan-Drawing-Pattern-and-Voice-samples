import os
import logging
from typing import Optional, Tuple
import wave
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

class AudioProcessor:
    """Utility class for audio processing operations"""
    
    @staticmethod
    def validate_audio_file(file_path: str) -> Tuple[bool, str]:
        """Validate audio file format and properties"""
        try:
            if not os.path.exists(file_path):
                return False, "File does not exist"
            
            # Check file extension
            if not file_path.lower().endswith('.wav'):
                return False, "Only .wav files are supported"
            
            # Check file size (max 50MB)
            file_size = os.path.getsize(file_path)
            if file_size > 50 * 1024 * 1024:  # 50MB
                return False, "File size too large. Maximum 50MB allowed."
            
            # Try to open and read the WAV file
            with wave.open(file_path, 'rb') as wav_file:
                # Check basic properties
                channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                frame_rate = wav_file.getframerate()
                frames = wav_file.getnframes()
                
                # Validate properties
                if channels != 1:
                    return False, "Only mono audio files are supported"
                
                if sample_width not in [1, 2, 4]:  # 8-bit, 16-bit, or 32-bit
                    return False, "Unsupported sample width"
                
                if frame_rate < 8000 or frame_rate > 48000:
                    return False, "Sample rate must be between 8kHz and 48kHz"
                
                if frames == 0:
                    return False, "Audio file contains no frames"
                
                duration = frames / frame_rate
                if duration < 0.5:  # Less than 0.5 seconds
                    return False, "Audio duration too short. Minimum 0.5 seconds required."
                
                if duration > 60:  # More than 60 seconds
                    return False, "Audio duration too long. Maximum 60 seconds allowed."
            
            return True, "File is valid"
            
        except wave.Error as e:
            return False, f"Invalid WAV file: {str(e)}"
        except Exception as e:
            return False, f"Error validating file: {str(e)}"
    
    @staticmethod
    def get_audio_info(file_path: str) -> Optional[dict]:
        """Get audio file information"""
        try:
            with wave.open(file_path, 'rb') as wav_file:
                info = {
                    'channels': wav_file.getnchannels(),
                    'sample_width': wav_file.getsampwidth(),
                    'frame_rate': wav_file.getframerate(),
                    'frames': wav_file.getnframes(),
                    'duration': wav_file.getnframes() / wav_file.getframerate(),
                    'file_size': os.path.getsize(file_path)
                }
                return info
        except Exception as e:
            logger.error(f"Error getting audio info: {str(e)}")
            return None
    
    @staticmethod
    def convert_sample_rate(audio_data: np.ndarray, original_sr: int, target_sr: int = 16000) -> np.ndarray:
        """Convert audio sample rate"""
        try:
            if original_sr == target_sr:
                return audio_data
            
            # Simple resampling (for production, use librosa.resample)
            ratio = target_sr / original_sr
            new_length = int(len(audio_data) * ratio)
            
            # Linear interpolation
            indices = np.linspace(0, len(audio_data) - 1, new_length)
            resampled = np.interp(indices, np.arange(len(audio_data)), audio_data)
            
            return resampled
            
        except Exception as e:
            logger.error(f"Error resampling audio: {str(e)}")
            return audio_data
    
    @staticmethod
    def normalize_audio(audio_data: np.ndarray) -> np.ndarray:
        """Normalize audio data to [-1, 1] range"""
        try:
            if len(audio_data) == 0:
                return audio_data
            
            max_val = np.max(np.abs(audio_data))
            if max_val == 0:
                return audio_data
            
            normalized = audio_data / max_val
            return normalized
            
        except Exception as e:
            logger.error(f"Error normalizing audio: {str(e)}")
            return audio_data
    
    @staticmethod
    def trim_silence(audio_data: np.ndarray, threshold_db: float = -40) -> np.ndarray:
        """Remove silence from beginning and end of audio"""
        try:
            if len(audio_data) == 0:
                return audio_data
            
            # Convert dB to linear scale
            threshold = 10 ** (threshold_db / 20)
            
            # Find non-silent regions
            energy = np.abs(audio_data)
            silent = energy < threshold
            
            # Find first and last non-silent samples
            start_idx = np.argmax(~silent)
            end_idx = len(audio_data) - np.argmax(~silent[::-1])
            
            if start_idx >= end_idx:
                return audio_data[:1]  # Return single sample if all silent
            
            return audio_data[start_idx:end_idx]
            
        except Exception as e:
            logger.error(f"Error trimming silence: {str(e)}")
            return audio_data
    
    @staticmethod
    def create_audio_chunks(audio_data: np.ndarray, chunk_duration: float, sample_rate: int) -> list:
        """Split audio into chunks of specified duration"""
        try:
            chunk_size = int(chunk_duration * sample_rate)
            chunks = []
            
            for i in range(0, len(audio_data), chunk_size):
                chunk = audio_data[i:i + chunk_size]
                if len(chunk) > 0:
                    chunks.append(chunk)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error creating audio chunks: {str(e)}")
            return [audio_data]
    
    @staticmethod
    def calculate_audio_statistics(audio_data: np.ndarray) -> dict:
        """Calculate basic audio statistics"""
        try:
            if len(audio_data) == 0:
                return {
                    'mean': 0.0,
                    'std': 0.0,
                    'min': 0.0,
                    'max': 0.0,
                    'rms': 0.0,
                    'dynamic_range': 0.0
                }
            
            stats = {
                'mean': float(np.mean(audio_data)),
                'std': float(np.std(audio_data)),
                'min': float(np.min(audio_data)),
                'max': float(np.max(audio_data)),
                'rms': float(np.sqrt(np.mean(audio_data ** 2))),
                'dynamic_range': float(np.max(audio_data) - np.min(audio_data))
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating audio statistics: {str(e)}")
            return {}
    
    @staticmethod
    def ensure_mono(audio_data: np.ndarray, channels: int) -> np.ndarray:
        """Ensure audio is mono (single channel)"""
        try:
            if channels == 1:
                return audio_data
            
            if channels == 2:
                # Convert stereo to mono by averaging channels
                if len(audio_data.shape) == 2:
                    return np.mean(audio_data, axis=1)
                else:
                    # Reshape if needed
                    reshaped = audio_data.reshape(-1, channels)
                    return np.mean(reshaped, axis=1)
            
            # For other channel counts, take first channel
            if len(audio_data.shape) > 1:
                return audio_data[:, 0]
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Error converting to mono: {str(e)}")
            return audio_data
