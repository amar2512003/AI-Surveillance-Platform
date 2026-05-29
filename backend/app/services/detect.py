from ultralytics import YOLO
from pathlib import Path
import cv2

model = YOLO("yolov8n.pt")

BASE_DIR = Path(__file__).resolve().parents[3]

video_path = BASE_DIR / "ml" / "videos" / "test.MP4"

print("Video path:", video_path)
print("Exists:", video_path.exists())

cap = cv2.VideoCapture(str(video_path))

while True:
    ret, frame = cap.read()

    if not ret:
        break

    results = model(frame)

    annotated = results[0].plot()

    cv2.imshow("YOLO Detection", annotated)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()