import torch
import numpy as np
import cv2
import os
from typing import Dict, List, Any, Optional, Tuple
import time
from datetime import datetime
import logging
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

# SAM2 imports (will be installed via requirements.txt)
try:
    from sam2.build_sam import build_sam2
    from sam2.sam2_image_predictor import SAM2ImagePredictor
    from sam2.automatic_mask_generator import SAM2AutomaticMaskGenerator
    SAM2_AVAILABLE = True
except ImportError:
    SAM2_AVAILABLE = False
    logging.warning("SAM2 not available. Please install SAM2 dependencies.")

logger = logging.getLogger(__name__)

class SAM2Service:
    """
    Service class for SAM2 chromosome segmentation
    """
    
    def __init__(self):
        self.predictor = None
        self.mask_generator = None
        self.device = None
        self.model_type = None
        self.is_initialized = False
        self.model_path = "models/sam2"
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def initialize(self, model_type: str = "sam2_hiera_small", use_gpu: bool = True):
        """
        Initialize SAM2 model
        """
        try:
            if not SAM2_AVAILABLE:
                logger.error("SAM2 is not available. Please install SAM2 dependencies.")
                return False
            
            # Set device
            if use_gpu and torch.cuda.is_available():
                self.device = torch.device("cuda")
                logger.info(f"Using GPU: {torch.cuda.get_device_name()}")
            else:
                self.device = torch.device("cpu")
                logger.info("Using CPU")
            
            # Download model if not exists
            await self._download_model(model_type)
            
            # Build SAM2 model
            model_cfg = self._get_model_config(model_type)
            checkpoint_path = os.path.join(self.model_path, f"{model_type}.pt")
            
            if not os.path.exists(checkpoint_path):
                logger.error(f"Model checkpoint not found: {checkpoint_path}")
                return False
            
            # Initialize model in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor, 
                self._initialize_model, 
                model_cfg, 
                checkpoint_path
            )
            
            self.model_type = model_type
            self.is_initialized = True
            logger.info(f"SAM2 model '{model_type}' initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize SAM2: {str(e)}")
            return False
    
    def _initialize_model(self, model_cfg: str, checkpoint_path: str):
        """
        Initialize SAM2 model in thread pool
        """
        # Build SAM2 model
        sam2_model = build_sam2(model_cfg, checkpoint_path, device=self.device)
        
        # Initialize predictor and mask generator
        self.predictor = SAM2ImagePredictor(sam2_model)
        self.mask_generator = SAM2AutomaticMaskGenerator(
            model=sam2_model,
            points_per_side=32,
            points_per_batch=64,
            pred_iou_thresh=0.8,
            stability_score_thresh=0.92,
            stability_score_offset=1.0,
            crop_n_layers=1,
            crop_n_points_downscale_factor=2,
            min_mask_region_area=500,  # Minimum area for chromosome masks
        )
    
    async def _download_model(self, model_type: str):
        """
        Download SAM2 model weights if not available
        """
        checkpoint_path = os.path.join(self.model_path, f"{model_type}.pt")
        
        if os.path.exists(checkpoint_path):
            logger.info(f"Model {model_type} already exists")
            return
        
        # URLs for SAM2 models
        model_urls = {
            "sam2_hiera_tiny": "https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_tiny.pt",
            "sam2_hiera_small": "https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_small.pt",
            "sam2_hiera_base_plus": "https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_base_plus.pt",
            "sam2_hiera_large": "https://dl.fbaipublicfiles.com/segment_anything_2/072824/sam2_hiera_large.pt"
        }
        
        if model_type not in model_urls:
            raise ValueError(f"Unknown model type: {model_type}")
        
        # Download model
        logger.info(f"Downloading SAM2 model: {model_type}")
        import urllib.request
        os.makedirs(self.model_path, exist_ok=True)
        
        try:
            urllib.request.urlretrieve(model_urls[model_type], checkpoint_path)
            logger.info(f"Model downloaded successfully: {checkpoint_path}")
        except Exception as e:
            logger.error(f"Failed to download model: {str(e)}")
            raise
    
    def _get_model_config(self, model_type: str) -> str:
        """
        Get model configuration path
        """
        config_map = {
            "sam2_hiera_tiny": "sam2_hiera_t.yaml",
            "sam2_hiera_small": "sam2_hiera_s.yaml",
            "sam2_hiera_base_plus": "sam2_hiera_b+.yaml",
            "sam2_hiera_large": "sam2_hiera_l.yaml"
        }
        
        if model_type not in config_map:
            raise ValueError(f"Unknown model type: {model_type}")
        
        return os.path.join("sam2", "configs", config_map[model_type])
    
    async def segment_chromosomes(
        self, 
        image_path: str, 
        confidence_threshold: float = 0.8,
        use_gpu: bool = True
    ) -> Dict[str, Any]:
        """
        Segment chromosomes from metaphase spread image
        """
        if not self.is_initialized:
            raise RuntimeError("SAM2 service not initialized")
        
        try:
            start_time = time.time()
            
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Run segmentation in thread pool
            loop = asyncio.get_event_loop()
            masks = await loop.run_in_executor(
                self.executor, 
                self._segment_image, 
                image_rgb, 
                confidence_threshold
            )
            
            # Process masks and extract chromosome information
            chromosomes = self._process_masks(masks, image_rgb)
            
            # Filter chromosomes based on size and shape
            filtered_chromosomes = self._filter_chromosomes(chromosomes)
            
            processing_time = time.time() - start_time
            
            return {
                "chromosomes": filtered_chromosomes,
                "total_count": len(filtered_chromosomes),
                "processing_time": processing_time,
                "image_dimensions": {
                    "width": image_rgb.shape[1],
                    "height": image_rgb.shape[0]
                },
                "confidence_threshold": confidence_threshold,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Segmentation failed: {str(e)}")
            raise
    
    def _segment_image(self, image_rgb: np.ndarray, confidence_threshold: float) -> List[Dict]:
        """
        Perform image segmentation using SAM2
        """
        # Generate masks automatically
        masks = self.mask_generator.generate(image_rgb)
        
        # Filter masks by confidence
        filtered_masks = [
            mask for mask in masks 
            if mask.get('predicted_iou', 0) >= confidence_threshold
        ]
        
        return filtered_masks
    
    def _process_masks(self, masks: List[Dict], image: np.ndarray) -> List[Dict]:
        """
        Process masks to extract chromosome information
        """
        chromosomes = []
        
        for i, mask_info in enumerate(masks):
            try:
                mask = mask_info['segmentation']
                
                # Extract chromosome properties
                chromosome_data = self._extract_chromosome_features(mask, image, i)
                
                if chromosome_data:
                    chromosomes.append(chromosome_data)
                    
            except Exception as e:
                logger.warning(f"Failed to process mask {i}: {str(e)}")
                continue
        
        return chromosomes
    
    def _extract_chromosome_features(self, mask: np.ndarray, image: np.ndarray, index: int) -> Optional[Dict]:
        """
        Extract features from chromosome mask
        """
        try:
            # Find contours
            contours, _ = cv2.findContours(
                mask.astype(np.uint8), 
                cv2.RETR_EXTERNAL, 
                cv2.CHAIN_APPROX_SIMPLE
            )
            
            if not contours:
                return None
            
            # Get the largest contour
            main_contour = max(contours, key=cv2.contourArea)
            
            # Calculate basic properties
            area = cv2.contourArea(main_contour)
            perimeter = cv2.arcLength(main_contour, True)
            
            # Bounding box
            x, y, w, h = cv2.boundingRect(main_contour)
            
            # Centroid
            M = cv2.moments(main_contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx, cy = x + w // 2, y + h // 2
            
            # Aspect ratio
            aspect_ratio = w / h if h != 0 else 0
            
            # Extent (area/bounding box area)
            extent = area / (w * h) if w * h != 0 else 0
            
            # Solidity (area/convex hull area)
            hull = cv2.convexHull(main_contour)
            hull_area = cv2.contourArea(hull)
            solidity = area / hull_area if hull_area != 0 else 0
            
            return {
                "id": f"chr_{index}",
                "mask": mask.tolist(),
                "contour": main_contour.tolist(),
                "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                "centroid": {"x": int(cx), "y": int(cy)},
                "area": int(area),
                "perimeter": float(perimeter),
                "aspect_ratio": float(aspect_ratio),
                "extent": float(extent),
                "solidity": float(solidity),
                "features": {
                    "length": max(w, h),
                    "width": min(w, h),
                    "elongation": max(w, h) / min(w, h) if min(w, h) != 0 else 0
                }
            }
            
        except Exception as e:
            logger.warning(f"Failed to extract features for chromosome {index}: {str(e)}")
            return None
    
    def _filter_chromosomes(self, chromosomes: List[Dict]) -> List[Dict]:
        """
        Filter chromosomes based on size and shape criteria
        """
        filtered = []
        
        for chromosome in chromosomes:
            # Filter by area (remove very small or very large objects)
            area = chromosome.get("area", 0)
            if area < 1000 or area > 50000:  # Adjust thresholds as needed
                continue
            
            # Filter by aspect ratio (chromosomes should be elongated)
            aspect_ratio = chromosome.get("aspect_ratio", 0)
            if aspect_ratio < 0.1 or aspect_ratio > 10:
                continue
            
            # Filter by solidity (chromosomes should be relatively solid)
            solidity = chromosome.get("solidity", 0)
            if solidity < 0.7:
                continue
            
            filtered.append(chromosome)
        
        return filtered
    
    async def segment_with_prompts(
        self, 
        image_path: str, 
        points: List[Tuple[int, int]], 
        labels: List[int]
    ) -> Dict[str, Any]:
        """
        Segment with user-provided prompts (points)
        """
        if not self.is_initialized:
            raise RuntimeError("SAM2 service not initialized")
        
        try:
            # Load image
            image = cv2.imread(image_path)
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Set image for predictor
            self.predictor.set_image(image_rgb)
            
            # Convert points and labels to numpy arrays
            points_array = np.array(points)
            labels_array = np.array(labels)
            
            # Run prediction in thread pool
            loop = asyncio.get_event_loop()
            masks, scores, _ = await loop.run_in_executor(
                self.executor,
                self.predictor.predict,
                points_array,
                labels_array
            )
            
            # Process results
            results = []
            for i, (mask, score) in enumerate(zip(masks, scores)):
                chromosome_data = self._extract_chromosome_features(mask, image_rgb, i)
                if chromosome_data:
                    chromosome_data["confidence"] = float(score)
                    results.append(chromosome_data)
            
            return {
                "chromosomes": results,
                "total_count": len(results),
                "input_points": points,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prompt-based segmentation failed: {str(e)}")
            raise 