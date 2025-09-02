from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class PredictionRequest(BaseModel):
    """Request model for voice prediction"""
    audio_data: Optional[str] = Field(None, description="Base64 encoded audio data")
    file_path: Optional[str] = Field(None, description="Path to audio file")

class FeatureImportance(BaseModel):
    """Model for feature importance data"""
    feature_name: str = Field(..., description="Name of the voice feature")
    importance_score: float = Field(..., description="Importance score of the feature")
    description: str = Field(..., description="Human-readable description of the feature")
    category: str = Field(..., description="Category of the feature (pitch, jitter, etc.)")

class ClinicalInterpretation(BaseModel):
    """Model for clinical interpretation of results"""
    overall_assessment: str = Field(..., description="Overall assessment of the voice sample")
    key_findings: List[str] = Field(..., description="Key findings from the analysis")
    recommendations: List[str] = Field(..., description="Clinical recommendations")
    risk_level: str = Field(..., description="Risk level assessment")
    confidence_level: str = Field(..., description="Confidence level of the prediction")

class PredictionResponse(BaseModel):
    """Response model for voice prediction results"""
    # Basic prediction info
    prediction: int = Field(..., description="Prediction: 0 for Healthy, 1 for Parkinson's Disease")
    prediction_label: str = Field(..., description="Human-readable prediction label")
    confidence: float = Field(..., description="Confidence score (0-1)")
    confidence_percentage: str = Field(..., description="Confidence as percentage")
    
    # Probability scores
    probability_healthy: float = Field(..., description="Probability of being healthy")
    probability_pd: float = Field(..., description="Probability of having Parkinson's disease")
    
    # Feature analysis
    top_features: List[FeatureImportance] = Field(..., description="Top contributing features")
    all_features: Dict[str, float] = Field(..., description="All extracted feature values")
    
    # Clinical information
    clinical_interpretation: ClinicalInterpretation = Field(..., description="Clinical interpretation")
    
    # Metadata
    processing_time: float = Field(..., description="Time taken to process the audio (seconds)")
    audio_duration: float = Field(..., description="Duration of the audio sample (seconds)")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp of analysis")
    
    # File information
    file_name: Optional[str] = Field(None, description="Name of the processed file")
    file_size: Optional[int] = Field(None, description="Size of the audio file in bytes")

class ModelInfoResponse(BaseModel):
    """Response model for model information"""
    model_name: str = Field(..., description="Name of the trained model")
    model_type: str = Field(..., description="Type of machine learning model")
    accuracy: float = Field(..., description="Model accuracy on test set")
    precision: float = Field(..., description="Model precision score")
    recall: float = Field(..., description="Model recall score")
    f1_score: float = Field(..., description="Model F1 score")
    
    # Feature information
    total_features: int = Field(..., description="Total number of features")
    feature_categories: List[str] = Field(..., description="Categories of features")
    
    # Training information
    training_date: Optional[str] = Field(None, description="Date when model was trained")
    dataset_info: Dict[str, Any] = Field(..., description="Information about training dataset")
    
    # Model parameters
    model_parameters: Dict[str, Any] = Field(..., description="Model hyperparameters")
    
    # Performance metrics
    performance_metrics: Dict[str, float] = Field(..., description="Additional performance metrics")

class AudioRecordingRequest(BaseModel):
    """Request model for audio recording"""
    audio_data: str = Field(..., description="Base64 encoded audio data")
    sample_rate: int = Field(default=16000, description="Audio sample rate")
    duration: float = Field(..., description="Duration of the recording in seconds")

class ErrorResponse(BaseModel):
    """Standard error response model"""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Timestamp of error")
    status_code: int = Field(..., description="HTTP status code")
