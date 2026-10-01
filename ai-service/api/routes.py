from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from detector import detector
import requests
from config import BACKEND_URL

router = APIRouter()

class CrowdInferenceRequest(BaseModel):
    area: str = "Main Entrance"
    simulated_count: Optional[int] = None
    sync_with_backend: bool = True

class SyncBackendRequest(BaseModel):
    area: str
    people_count: int
    source: str = "YOLO_AI_SERVICE"

@router.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Temple Crowd Detection AI Service",
        "yolo_loaded": detector.is_yolo_loaded,
        "version": "1.0.0"
    }

@router.post("/detect-image")
async def detect_from_image(
    file: UploadFile = File(...),
    area: str = Form("Main Entrance"),
    sync_backend: bool = Form(True)
):
    """
    Receives an uploaded CCTV snapshot or video frame, executes YOLO person detection,
    computes area occupancy and crowd density tier, and syncs result with Node.js backend.
    """
    try:
        contents = await file.read()
        result = detector.detect_people_in_image(contents, area_name=area)

        # Sync with Node.js backend
        if sync_backend:
            try:
                requests.post(
                    f"{BACKEND_URL}/api/crowd/update",
                    json={
                        "area": result["area"],
                        "people_count": result["people_count"],
                        "source": "YOLO_AI_SERVICE"
                    },
                    timeout=3
                )
            except Exception as e:
                result["backend_sync_warning"] = f"Could not sync with backend: {str(e)}"

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/detect-stream-frame")
def detect_stream_frame(payload: CrowdInferenceRequest):
    """
    Simulated or live CCTV frame polling endpoint.
    Returns calculated crowd metrics for the designated temple area.
    """
    result = detector.detect_people_in_image(b"", area_name=payload.area)

    if payload.simulated_count is not None:
        capacity = result["capacity"]
        count = payload.simulated_count
        occupancy = round((count / capacity) * 100, 1)
        level = "HIGH" if occupancy >= 75.0 else ("MODERATE" if occupancy >= 45.0 else "LOW")
        result["people_count"] = count
        result["occupancy"] = occupancy
        result["crowd_level"] = level

    if payload.sync_with_backend:
        try:
            requests.post(
                f"{BACKEND_URL}/api/crowd/update",
                json={
                    "area": result["area"],
                    "people_count": result["people_count"],
                    "source": "YOLO_AI_SERVICE"
                },
                timeout=3
            )
        except Exception:
            pass

    return result

@router.get("/areas-status")
def get_all_areas_ai_metrics():
    """
    Evaluates current metrics across all 6 temple zones.
    """
    from config import AREA_CAPACITIES
    all_areas = []
    for area_name in AREA_CAPACITIES.keys():
        metrics = detector.detect_people_in_image(b"", area_name=area_name)
        all_areas.append(metrics)
    return {
        "status": "SUCCESS",
        "zones": all_areas,
        "is_demo_mode": not detector.is_yolo_loaded
    }
