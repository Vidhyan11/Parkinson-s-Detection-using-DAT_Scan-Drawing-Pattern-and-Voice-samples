from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
import asyncio
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
import traceback
import os
import tempfile
import base64
from pathlib import Path
import json

# Import your services
from services.feature_extractor import VoiceFeatureExtractor
from utils.model_loader import ModelLoader
from services.voice_analyzer import VoiceAnalyzer
from models.prediction_models import PredictionResponse, AudioRecordingRequest

# Import multimodal services
from services.multimodal_service import MultimodalAnalysisService
from services.datscan_service import DATScanAnalysisService
from services.spiral_service import SpiralAnalysisService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
model_loader = ModelLoader()
voice_analyzer = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Initializing Parkinson's Voice Detection System...")
    try:
        # Load ML model
        success = model_loader.load_model()
        if not success:
            raise Exception("Failed to load ML model")
        
        # Initialize feature extractor and voice analyzer
        global voice_analyzer
        feature_extractor = VoiceFeatureExtractor()
        voice_analyzer = VoiceAnalyzer(model_loader, feature_extractor)
        
        logger.info("✅ System initialized successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to initialize system: {str(e)}")
        traceback.print_exc()
        raise e
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="ParkIQ - Parkinson's Voice Detection API",
    description="AI-powered voice analysis for early detection of Parkinson's disease",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    try:
        return {
            "message": "ParkIQ Parkinson's Voice Detection API",
            "version": "1.0.0",
            "status": "operational",
            "model_loaded": model_loader.model_loaded if model_loader else False
        }
    except Exception as e:
        logger.error(f"Root endpoint error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Server error: {str(e)}"}
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        return {
            "status": "healthy",
            "model_loaded": model_loader.model_loaded if model_loader else False,
            "voice_analyzer_ready": voice_analyzer is not None,
            "timestamp": "2025-09-03T03:13:00Z"
        }
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"detail": f"Health check failed: {str(e)}"}
        )

@app.get("/model-info")
async def get_model_info():
    """Get model information and metadata"""
    try:
        if not model_loader:
            raise HTTPException(status_code=503, detail="Model loader not initialized")
        
        if not model_loader.model_loaded:
            raise HTTPException(status_code=503, detail="Model not loaded")
        
        feature_names = model_loader.feature_names if model_loader.feature_names else []
        
        return {
            "model_type": "XGBoost Classifier",
            "accuracy": 86.61,
            "auc_score": 90.5,
            "features_count": len(feature_names),
            "training_data": "Voice samples from Parkinson's patients and healthy controls",
            "model_loaded": model_loader.model_loaded,
            "sample_features": feature_names[:10] if len(feature_names) > 10 else feature_names,
            "version": "1.0.0"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model info error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to get model information")

@app.get("/features")
async def get_features_info():
    """Get information about voice features analyzed"""
    try:
        features_info = {
            "total_features": 35,
            "feature_categories": {
                "pitch_features": ["pitch_mean", "pitch_std", "pitch_min", "pitch_max"],
                "voice_quality": ["jitter_percent", "shimmer_percent", "hnr"],
                "formant_features": ["formant_f1_mean", "formant_f2_mean"],
                "spectral_features": ["spectral_centroid_mean", "spectral_rolloff_mean"],
                "mfcc_features": [f"mfcc_{i}" for i in range(1, 14)]
            },
            "clinical_relevance": {
                "jitter": "Measures vocal cord stability - higher in PD",
                "shimmer": "Measures amplitude variation - irregular in PD", 
                "hnr": "Harmonics-to-noise ratio - lower in PD (breathier voice)",
                "pitch": "Fundamental frequency analysis - reduced range in PD"
            }
        }
        return features_info
    except Exception as e:
        logger.error(f"Features info error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get features information")

@app.post("/multimodal-analysis")
async def multimodal_analysis(
    voice_file: Optional[UploadFile] = File(None),
    datscan_file: Optional[UploadFile] = File(None),
    spiral_data: Optional[str] = Form(None),
    patient_age: Optional[str] = Form(None),
    patient_gender: Optional[str] = Form(None)
):
    """Multi-modal Parkinson's disease detection using late fusion"""
    try:
        # Initialize multimodal service
        multimodal_service = MultimodalAnalysisService()
        
        # Prepare analysis data
        analysis_data = {
            'voice_file': voice_file,
            'datscan_file': datscan_file,
            'spiral_data': spiral_data,
            'patient_age': patient_age,
            'patient_gender': patient_gender
        }
        
        # Perform multimodal analysis
        result = await multimodal_service.analyze_multimodal(analysis_data)
        
        return result
        
    except Exception as e:
        logger.error(f"Multimodal analysis error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Multimodal analysis failed: {str(e)}")

@app.post("/datscan-analyze")
async def datscan_analysis(file: UploadFile = File(...)):
    """Analyze DATScan image for Parkinson's detection"""
    try:
        datscan_service = DATScanAnalysisService()
        
        # Validate file
        if not file.filename.lower().endswith(('.dcm', '.nii', '.jpg', '.png')):
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload DICOM, NIfTI, JPG, or PNG files.")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            result = await datscan_service.analyze_datscan(temp_file_path)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"DATScan analysis error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"DATScan analysis failed: {str(e)}")

@app.post("/spiral-analyze")
async def spiral_analysis(
    spiral_data: str = Form(...),
    drawing_time: Optional[float] = Form(None)
):
    """Analyze spiral drawing for Parkinson's detection"""
    try:
        spiral_service = SpiralAnalysisService()
        
        # Decode base64 image data
        try:
            # Remove data URL prefix if present
            if spiral_data.startswith('data:image'):
                spiral_data = spiral_data.split(',')[1]
            
            result = await spiral_service.analyze_spiral(spiral_data, drawing_time)
            return result
        except Exception as decode_error:
            raise HTTPException(status_code=400, detail="Invalid spiral image data")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Spiral analysis error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Spiral analysis failed: {str(e)}")

@app.post("/predict")
async def predict_from_file(file: UploadFile = File(...)):
    """Analyze uploaded audio file for Parkinson's detection"""
    try:
        if not voice_analyzer:
            raise HTTPException(status_code=503, detail="Voice analyzer not initialized")
        
        # Validate file
        if not file.filename.lower().endswith(('.wav', '.mp3', '.m4a')):
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload WAV, MP3, or M4A files.")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # ✅ FIXED: Use analyze_voice instead of analyze_file
            result = await voice_analyzer.analyze_voice(temp_file_path)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File prediction error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/record")
async def predict_from_recording(request: AudioRecordingRequest):
    """Analyze base64 encoded audio recording for Parkinson's detection"""
    try:
        if not voice_analyzer:
            raise HTTPException(status_code=503, detail="Voice analyzer not initialized")
        
        # ✅ FIXED: Use analyze_recorded_audio method directly with base64 data
        result = await voice_analyzer.analyze_recorded_audio(request.audio_data)
        return result
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recording prediction error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )