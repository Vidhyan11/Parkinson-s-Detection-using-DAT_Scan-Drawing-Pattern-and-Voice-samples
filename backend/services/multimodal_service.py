"""
Multimodal Analysis Service for Late Fusion
Combines Voice, DATScan, and Spiral analysis results
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import tempfile
import os

from services.voice_analyzer import VoiceAnalyzer
from services.datscan_service import DATScanAnalysisService
from services.spiral_service import SpiralAnalysisService
from utils.model_loader import ModelLoader

logger = logging.getLogger(__name__)

class MultimodalAnalysisService:
    """Handles late fusion of multiple AI models for Parkinson's detection"""
    
    def __init__(self):
        self.voice_analyzer = None
        self.datscan_service = None
        self.spiral_service = None
        self._initialize_services()
    
    def _initialize_services(self):
        """Initialize all analysis services"""
        try:
            # Initialize voice analyzer
            model_loader = ModelLoader()
            if model_loader.load_model():
                feature_extractor = None  # Will be initialized in voice_analyzer
                self.voice_analyzer = VoiceAnalyzer(model_loader, feature_extractor)
                logger.info("✅ Voice analyzer initialized")
            
            # Initialize DATScan service
            self.datscan_service = DATScanAnalysisService()
            logger.info("✅ DATScan service initialized")
            
            # Initialize spiral service
            self.spiral_service = SpiralAnalysisService()
            logger.info("✅ Spiral service initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize services: {e}")
    
    async def analyze_multimodal(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Perform multimodal analysis with late fusion"""
        start_time = datetime.now()
        
        try:
            # Initialize results
            individual_results = {}
            models_used = []
            errors = []
            
            # 1. Voice Analysis (if provided)
            voice_result = None
            if analysis_data.get('voice_file'):
                try:
                    voice_result = await self._analyze_voice(analysis_data['voice_file'])
                    individual_results['voice'] = voice_result
                    models_used.append('voice')
                    logger.info("✅ Voice analysis completed")
                except Exception as e:
                    error_msg = f"Voice analysis failed: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            
            # 2. DATScan Analysis (if provided)
            datscan_result = None
            if analysis_data.get('datscan_file'):
                try:
                    datscan_result = await self._analyze_datscan(analysis_data['datscan_file'])
                    individual_results['datscan'] = datscan_result
                    models_used.append('datscan')
                    logger.info("✅ DATScan analysis completed")
                except Exception as e:
                    error_msg = f"DATScan analysis failed: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            
            # 3. Spiral Analysis (if provided)
            spiral_result = None
            if analysis_data.get('spiral_data'):
                try:
                    spiral_result = await self._analyze_spiral(
                        analysis_data['spiral_data'],
                        analysis_data.get('drawing_time')
                    )
                    individual_results['spiral'] = spiral_result
                    models_used.append('spiral')
                    logger.info("✅ Spiral analysis completed")
                except Exception as e:
                    error_msg = f"Spiral analysis failed: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
            
            # Perform late fusion
            fusion_result = self._perform_late_fusion(individual_results)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Generate clinical summary and recommendations
            clinical_summary = self._generate_clinical_summary(fusion_result, individual_results)
            recommendations = self._generate_recommendations(fusion_result, individual_results)
            
            # Build final response
            response = {
                "fusion_prediction": fusion_result['prediction'],
                "fusion_prediction_label": fusion_result['prediction_label'],
                "fusion_confidence": fusion_result['confidence'],
                "fusion_probability_pd": fusion_result['probability_pd'],
                "fusion_probability_healthy": fusion_result['probability_healthy'],
                "individual_results": individual_results,
                "fusion_weights": {
                    "voice": 0.20,
                    "datscan": 0.50,
                    "spiral": 0.30
                },
                "models_used": models_used,
                "total_processing_time": processing_time,
                "clinical_summary": clinical_summary,
                "recommendations": recommendations,
                "errors": errors if errors else None,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"✅ Multimodal analysis completed in {processing_time:.2f}s")
            return response
            
        except Exception as e:
            logger.error(f"Multimodal analysis failed: {e}")
            raise
    
    async def _analyze_voice(self, voice_file) -> Dict[str, Any]:
        """Analyze voice file"""
        if not self.voice_analyzer:
            raise Exception("Voice analyzer not initialized")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await voice_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            result = await self.voice_analyzer.analyze_voice(temp_file_path)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    async def _analyze_datscan(self, datscan_file) -> Dict[str, Any]:
        """Analyze DATScan file"""
        if not self.datscan_service:
            raise Exception("DATScan service not initialized")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            content = await datscan_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            result = await self.datscan_service.analyze_datscan(temp_file_path)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    async def _analyze_spiral(self, spiral_data: str, drawing_time: Optional[float]) -> Dict[str, Any]:
        """Analyze spiral drawing data"""
        if not self.spiral_service:
            raise Exception("Spiral service not initialized")
        
        result = await self.spiral_service.analyze_spiral(spiral_data, drawing_time)
        return result
    
    def _perform_late_fusion(self, individual_results: Dict[str, Any]) -> Dict[str, Any]:
        """Perform late fusion using weighted averaging with confidence adjustment"""
        
        # Base weights for each modality
        base_weights = {
            'voice': 0.20,
            'datscan': 0.50,
            'spiral': 0.30
        }
        
        # Initialize fusion variables
        total_weighted_probability = 0.0
        total_weight = 0.0
        total_confidence = 0.0
        available_models = 0
        
        # Process each available model result
        for model_type, result in individual_results.items():
            if result and 'probability_pd' in result:
                # Get base weight for this model
                base_weight = base_weights.get(model_type, 0.1)
                
                # Adjust weight based on confidence
                confidence = result.get('confidence', 0.5)
                adjusted_weight = base_weight * confidence
                
                # Add to weighted sum
                total_weighted_probability += result['probability_pd'] * adjusted_weight
                total_weight += adjusted_weight
                total_confidence += confidence
                available_models += 1
        
        # Calculate fusion results
        if total_weight > 0:
            fusion_probability_pd = total_weighted_probability / total_weight
            fusion_probability_healthy = 1.0 - fusion_probability_pd
            fusion_confidence = total_confidence / available_models if available_models > 0 else 0.0
            
            # Determine prediction (threshold at 0.5)
            fusion_prediction = 1 if fusion_probability_pd > 0.5 else 0
            fusion_prediction_label = "Parkinson's Disease" if fusion_prediction == 1 else "Healthy"
        else:
            # Fallback if no models available
            fusion_probability_pd = 0.5
            fusion_probability_healthy = 0.5
            fusion_confidence = 0.0
            fusion_prediction = 0
            fusion_prediction_label = "Insufficient Data"
        
        return {
            'prediction': fusion_prediction,
            'prediction_label': fusion_prediction_label,
            'confidence': fusion_confidence,
            'probability_pd': fusion_probability_pd,
            'probability_healthy': fusion_probability_healthy
        }
    
    def _generate_clinical_summary(self, fusion_result: Dict[str, Any], individual_results: Dict[str, Any]) -> str:
        """Generate clinical summary based on fusion results"""
        
        prediction = fusion_result['prediction']
        confidence = fusion_result['confidence']
        probability_pd = fusion_result['probability_pd']
        
        if prediction == 1:  # Parkinson's Disease
            if confidence > 0.8:
                severity = "high confidence"
            elif confidence > 0.6:
                severity = "moderate confidence"
            else:
                severity = "low confidence"
            
            summary = f"Multi-modal analysis indicates {severity} for Parkinson's Disease "
            summary += f"(probability: {probability_pd:.1%}). "
            
            if 'datscan' in individual_results:
                summary += "DATScan imaging shows reduced dopamine transporter activity. "
            if 'voice' in individual_results:
                summary += "Voice analysis reveals characteristic vocal changes. "
            if 'spiral' in individual_results:
                summary += "Spiral drawing demonstrates motor control deficits. "
                
        else:  # Healthy
            if confidence > 0.8:
                summary = "Multi-modal analysis shows no significant indicators of Parkinson's Disease "
                summary += f"(confidence: {confidence:.1%}). "
            else:
                summary = "Multi-modal analysis suggests healthy status, though with limited confidence. "
            
            summary += "All analyzed modalities are within normal ranges."
        
        return summary
    
    def _generate_recommendations(self, fusion_result: Dict[str, Any], individual_results: Dict[str, Any]) -> list:
        """Generate clinical recommendations based on results"""
        
        recommendations = []
        prediction = fusion_result['prediction']
        confidence = fusion_result['confidence']
        
        if prediction == 1:  # Parkinson's Disease
            if confidence > 0.7:
                recommendations.append("Schedule comprehensive neurological evaluation")
                recommendations.append("Consider referral to movement disorder specialist")
                recommendations.append("Begin baseline motor function assessment")
            else:
                recommendations.append("Schedule follow-up evaluation for confirmation")
                recommendations.append("Monitor for symptom progression")
                recommendations.append("Consider additional diagnostic testing")
            
            if 'datscan' in individual_results:
                recommendations.append("DATScan results support clinical diagnosis")
            if 'voice' in individual_results:
                recommendations.append("Voice changes warrant speech therapy evaluation")
            if 'spiral' in individual_results:
                recommendations.append("Motor assessment indicates need for physical therapy")
                
        else:  # Healthy
            if confidence > 0.8:
                recommendations.append("Continue routine health monitoring")
                recommendations.append("No immediate follow-up required")
            else:
                recommendations.append("Consider repeat testing in 6-12 months")
                recommendations.append("Monitor for new symptoms")
        
        # General recommendations
        recommendations.append("Maintain regular exercise routine")
        recommendations.append("Schedule annual neurological check-up")
        
        return recommendations
