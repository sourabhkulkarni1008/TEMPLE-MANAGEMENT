import logging
import random
import numpy as np
from config import AREA_CAPACITIES, CONFIDENCE_THRESHOLD, YOLO_MODEL_NAME

logger = logging.getLogger("ai_detector")

class PersonDetector:
    def __init__(self):
        self.model = None
        self.is_yolo_loaded = False
        self._initialize_model()

    def _initialize_model(self):
        """Attempts to load YOLOv8 model from ultralytics or OpenCV HOG fallback"""
        try:
            from ultralytics import YOLO
            self.model = YOLO(YOLO_MODEL_NAME)
            self.is_yolo_loaded = True
            logger.info(f"Loaded YOLOv8 model: {YOLO_MODEL_NAME}")
        except Exception as e:
            logger.warning(f"Ultralytics YOLO unavailable ({e}). Using OpenCV HOG / Demo Computer Vision mode.")
            self.is_yolo_loaded = False

    def detect_people_in_image(self, image_bytes: bytes, area_name: str = "Main Entrance"):
        """
        Processes image frame and counts detected persons.
        Returns detailed bounding boxes and occupancy metrics.
        """
        capacity = AREA_CAPACITIES.get(area_name, 200)
        detections = []
        person_count = 0
        processing_mode = "YOLOv8-Inference" if self.is_yolo_loaded else "Demo-Vision-Simulation"

        if self.is_yolo_loaded and image_bytes:
            try:
                import cv2
                np_arr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                # Class 0 in COCO is 'person'
                results = self.model(img, classes=[0], conf=CONFIDENCE_THRESHOLD, verbose=False)
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        b = box.xyxy[0].tolist()
                        conf = float(box.conf[0])
                        detections.append({
                            "bbox": [round(x, 1) for x in b],
                            "confidence": round(conf, 2),
                            "class": "person"
                        })
                person_count = len(detections)
            except Exception as ex:
                logger.error(f"Inference error: {ex}. Falling back to visual simulation.")
                person_count = self._simulate_person_count(area_name)
                processing_mode = "Demo-Fallback"
        else:
            # Simulated visual detection for prototype evaluation
            person_count = self._simulate_person_count(area_name)
            detections = self._generate_simulated_boxes(person_count)

        occupancy = round((person_count / capacity) * 100, 1)
        crowd_level = "LOW"
        if occupancy >= 75.0:
            crowd_level = "HIGH"
        elif occupancy >= 45.0:
            crowd_level = "MODERATE"

        return {
            "area": area_name,
            "people_count": person_count,
            "capacity": capacity,
            "occupancy": occupancy,
            "crowd_level": crowd_level,
            "detections": detections[:20], # limit payload size
            "processing_mode": processing_mode,
            "is_demo_data": not self.is_yolo_loaded or processing_mode.startswith("Demo")
        }

    def _simulate_person_count(self, area_name: str) -> int:
        capacity = AREA_CAPACITIES.get(area_name, 200)
        # Area specific realistic distributions
        if "Queue" in area_name:
            return random.randint(int(capacity * 0.65), int(capacity * 0.88))
        elif "Sanctum" in area_name or "Darshan" in area_name:
            return random.randint(int(capacity * 0.45), int(capacity * 0.68))
        elif "Exit" in area_name:
            return random.randint(int(capacity * 0.2), int(capacity * 0.4))
        else:
            return random.randint(int(capacity * 0.35), int(capacity * 0.6))

    def _generate_simulated_boxes(self, count: int):
        boxes = []
        sample_count = min(count, 15)
        for i in range(sample_count):
            x1 = random.randint(50, 500)
            y1 = random.randint(50, 350)
            w = random.randint(30, 80)
            h = random.randint(80, 160)
            boxes.append({
                "bbox": [x1, y1, x1 + w, y1 + h],
                "confidence": round(random.uniform(0.72, 0.96), 2),
                "class": "person"
            })
        return boxes

detector = PersonDetector()
