# Smart Temple AI Crowd Detection Service

This standalone microservice is developed in **Python / FastAPI / OpenCV / YOLOv8** to estimate human crowd density from temple CCTV streams and camera snapshots.

## Key Features
1. **YOLOv8 Person Detection**: Classifies and counts persons (`class: 0`) in CCTV camera frames.
2. **Occupancy & Crowd Density Formula**:
   $$\text{occupancy} = \frac{\text{detected\_people}}{\text{area\_capacity}} \times 100$$
3. **Crowd Level Tiers**:
   - `LOW` ($< 45\%$)
   - `MODERATE` ($45\% - 74.9\%$)
   - `HIGH` ($\ge 75\%$)
4. **Backend Sync**: Dispatches real-time updates directly to the Node.js backend (`POST /api/crowd/update`).
5. **Zero-Hardware Demo Mode**: Automatically produces synthetic vision detections and realistic density shifts if running without physical CCTV hardware.

## How to Run
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
Swagger API docs will be available at `http://localhost:8000/docs`.
