from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
from datetime import datetime
import uuid
import shutil
from typing import List, Optional
import json

from app.api.routes import router
from app.services.sam2_service import SAM2Service
from app.services.image_service import ImageService
from app.models.analysis import AnalysisModel, AnalysisCreate, AnalysisResponse

app = FastAPI(
    title="ChromoScope API",
    description="AI-Powered Chromosome Analysis Platform with SAM2 Integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Initialize services
sam2_service = SAM2Service()
image_service = ImageService()

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)
os.makedirs("models/sam2", exist_ok=True)

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    await sam2_service.initialize()
    print("ChromoScope API is ready!")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ChromoScope API - AI-Powered Chromosome Analysis Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "sam2": sam2_service.is_initialized,
            "image_processing": True
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 