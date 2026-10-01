import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
YOLO_MODEL_NAME = os.getenv("YOLO_MODEL_NAME", "yolov8n.pt") # lightweight nano model
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
SIMULATED_MODE = os.getenv("SIMULATED_MODE", "true").lower() == "true"

# Temple Areas Capacities
AREA_CAPACITIES = {
    "Main Entrance": 250,
    "Queue Area": 350,
    "Darshan Hall": 180,
    "Prasadam Area": 200,
    "Exit Area": 150,
    "Parking": 300
}
