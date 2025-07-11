from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import os
import uuid
import shutil
from datetime import datetime
import json

from app.services.sam2_service import SAM2Service
from app.services.image_service import ImageService
from app.services.analysis_service import AnalysisService
from app.models.analysis import AnalysisCreate, AnalysisResponse, SegmentationRequest, ClassificationRequest
from app.models.upload import UploadResponse

router = APIRouter()

# Service instances
sam2_service = SAM2Service()
image_service = ImageService()
analysis_service = AnalysisService()

@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload a metaphase spread image for analysis
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique analysis ID
    analysis_id = str(uuid.uuid4())
    
    # Save uploaded file
    file_path = f"uploads/{analysis_id}_{file.filename}"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Process image metadata
    try:
        metadata = await image_service.process_image_metadata(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")
    
    # Create analysis record
    analysis_data = AnalysisCreate(
        id=analysis_id,
        filename=file.filename,
        file_path=file_path,
        metadata=metadata,
        status="uploaded",
        created_at=datetime.now()
    )
    
    await analysis_service.create_analysis(analysis_data)
    
    return UploadResponse(
        analysis_id=analysis_id,
        filename=file.filename,
        file_size=metadata.get("file_size", 0),
        image_dimensions=metadata.get("dimensions", {}),
        message="Image uploaded successfully"
    )

@router.post("/segment")
async def segment_image(request: SegmentationRequest):
    """
    Perform chromosome segmentation using SAM2
    """
    try:
        # Get analysis record
        analysis = await analysis_service.get_analysis(request.analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Update status
        await analysis_service.update_analysis_status(request.analysis_id, "segmenting")
        
        # Perform segmentation
        segmentation_results = await sam2_service.segment_chromosomes(
            analysis.file_path,
            confidence_threshold=request.confidence_threshold,
            use_gpu=request.use_gpu
        )
        
        # Save segmentation results
        await analysis_service.save_segmentation_results(request.analysis_id, segmentation_results)
        
        # Update status
        await analysis_service.update_analysis_status(request.analysis_id, "segmented")
        
        return {
            "analysis_id": request.analysis_id,
            "status": "segmented",
            "chromosome_count": len(segmentation_results["chromosomes"]),
            "segmentation_results": segmentation_results,
            "processing_time": segmentation_results.get("processing_time", 0)
        }
        
    except Exception as e:
        await analysis_service.update_analysis_status(request.analysis_id, "error")
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")

@router.post("/classify")
async def classify_chromosomes(request: ClassificationRequest):
    """
    Classify segmented chromosomes
    """
    try:
        # Get analysis record
        analysis = await analysis_service.get_analysis(request.analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status != "segmented":
            raise HTTPException(status_code=400, detail="Analysis must be segmented first")
        
        # Update status
        await analysis_service.update_analysis_status(request.analysis_id, "classifying")
        
        # Get segmentation results
        segmentation_results = await analysis_service.get_segmentation_results(request.analysis_id)
        
        # Perform classification
        classification_results = await analysis_service.classify_chromosomes(
            analysis.file_path,
            segmentation_results,
            model_type=request.model_type
        )
        
        # Save classification results
        await analysis_service.save_classification_results(request.analysis_id, classification_results)
        
        # Update status
        await analysis_service.update_analysis_status(request.analysis_id, "completed")
        
        return {
            "analysis_id": request.analysis_id,
            "status": "completed",
            "classification_results": classification_results,
            "karyotype": classification_results.get("karyotype", ""),
            "abnormalities": classification_results.get("abnormalities", [])
        }
        
    except Exception as e:
        await analysis_service.update_analysis_status(request.analysis_id, "error")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@router.get("/results/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_results(analysis_id: str):
    """
    Get complete analysis results
    """
    try:
        analysis = await analysis_service.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Get all results
        results = await analysis_service.get_complete_results(analysis_id)
        
        return AnalysisResponse(
            analysis_id=analysis_id,
            filename=analysis.filename,
            status=analysis.status,
            created_at=analysis.created_at,
            updated_at=analysis.updated_at,
            metadata=analysis.metadata,
            segmentation_results=results.get("segmentation_results"),
            classification_results=results.get("classification_results")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

@router.get("/history")
async def get_analysis_history(
    limit: int = 10,
    offset: int = 0,
    status: Optional[str] = None
):
    """
    Get analysis history
    """
    try:
        history = await analysis_service.get_analysis_history(
            limit=limit,
            offset=offset,
            status=status
        )
        
        return {
            "analyses": history,
            "total_count": len(history),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """
    Delete an analysis and its associated files
    """
    try:
        success = await analysis_service.delete_analysis(analysis_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return {"message": "Analysis deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")

@router.get("/models/status")
async def get_models_status():
    """
    Get the status of all AI models
    """
    return {
        "sam2": {
            "status": "loaded" if sam2_service.is_initialized else "not_loaded",
            "model_type": sam2_service.model_type if sam2_service.is_initialized else None,
            "device": sam2_service.device if sam2_service.is_initialized else None
        },
        "classification": {
            "status": "loaded",
            "model_type": "custom_chromosome_classifier"
        }
    } 