import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as ai_router
from config import PORT, HOST

app = FastAPI(
    title="Smart Temple AI Crowd Vision API",
    description="Python FastAPI + OpenCV + YOLO service for real-time pilgrim crowd estimation & occupancy tracking.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(ai_router, prefix="/api/ai", tags=["Crowd Detection"])

@app.get("/")
def root():
    return {
        "message": "Smart Temple AI Crowd Detection Service is running.",
        "docs_url": "/docs",
        "health_check": "/api/ai/health"
    }

if __name__ == "__main__":
    print(f"Starting Smart Temple AI Crowd Service on {HOST}:{PORT}...")
    uvicorn.run("main:app", host=HOST, port=PORT, reload=True)
