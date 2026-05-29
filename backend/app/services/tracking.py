from datetime import datetime

import cv2
from ultralytics import YOLO

from app.services.event_logger import process_tracks
from app.services.zone_detector import (
    point_in_zone,
    ZONE_X1,
    ZONE_Y1,
    ZONE_X2,
    ZONE_Y2
)
from app.services.threat_scorer import score_event
from app.services.json_logger import save_event
from app.services.db_logger import save_event_db
from app.services.face_recognition import identify_face


# -------------------------
# YOLO Model
# -------------------------

model = YOLO("yolov8n.pt")

# Face recognition demo video
video_path = "../ml/videos/face_demo.mp4"

cap = cv2.VideoCapture(video_path)

# -------------------------
# Caches
# -------------------------

intrusion_logged = set()
recognized_tracks = {}

# -------------------------
# Main Loop
# -------------------------

while True:

    ret, frame = cap.read()

    if not ret:
        break

    results = model.track(
        frame,
        persist=True,
        tracker="bytetrack.yaml",
        classes=[0]
    )

    track_ids = []

    if results[0].boxes.id is not None:

        track_ids = (
            results[0]
            .boxes
            .id
            .cpu()
            .numpy()
            .astype(int)
            .tolist()
        )

        boxes = results[0].boxes

        for i in range(len(boxes)):

            x1, y1, x2, y2 = (
                boxes.xyxy[i]
                .cpu()
                .numpy()
            )

            track_id = int(
                boxes.id[i]
                .cpu()
                .numpy()
            )

            # -------------------------
            # FACE RECOGNITION
            # -------------------------

            if track_id not in recognized_tracks:

                x1i = max(0, int(x1))
                y1i = max(0, int(y1))
                x2i = max(0, int(x2))
                y2i = max(0, int(y2))

                person_crop = frame[
                    y1i:y2i,
                    x1i:x2i
                ]

                if person_crop.size > 0:

                    temp_face_path = (
                        f"/tmp/track_{track_id}.jpg"
                    )

                    cv2.imwrite(
                        temp_face_path,
                        person_crop
                    )

                    print(
                        "Track ID:",
                        track_id
                    )

                    print(
                        "Face image saved:",
                        temp_face_path
                    )

                    try:

                        person_name = identify_face(
                            temp_face_path
                        )

                    except Exception as e:

                        print(
                            "Face Recognition Error:",
                            e
                        )

                        person_name = "Unknown"

                    recognized_tracks[
                        track_id
                    ] = person_name

                    if person_name == "Unknown":

                        score, severity = score_event(
                            "person_detected"
                        )

                        event = {
                            "event_type":
                            "unknown_person",

                            "track_id":
                            track_id,

                            "threat_score":
                            score,

                            "severity":
                            "L3",

                            "timestamp":
                            datetime.now().isoformat()
                        }

                    else:

                        event = {
                            "event_type":
                            "known_person",

                            "track_id":
                            track_id,

                            "person_name":
                            person_name,

                            "threat_score":
                            0.1,

                            "severity":
                            "L1",

                            "timestamp":
                            datetime.now().isoformat()
                        }

                    print(event)

                    save_event(event)
                    save_event_db(event)

            # -------------------------
            # ZONE INTRUSION
            # -------------------------

            center_x = int(
                (x1 + x2) / 2
            )

            center_y = int(
                (y1 + y2) / 2
            )

            if point_in_zone(
                center_x,
                center_y
            ):

                if track_id not in intrusion_logged:

                    intrusion_logged.add(
                        track_id
                    )

                    score, severity = score_event(
                        "zone_intrusion"
                    )

                    person_name = (
                        recognized_tracks.get(
                            track_id,
                            "Unknown"
                        )
                    )

                    event = {
                        "event_type":
                        "zone_intrusion",

                        "track_id":
                        track_id,

                        "person_name":
                        person_name,

                        "threat_score":
                        score,

                        "severity":
                        severity,

                        "timestamp":
                        datetime.now().isoformat()
                    }

                    print(event)

                    save_event(event)
                    save_event_db(event)

    # -------------------------
    # ENTRY / EXIT EVENTS
    # -------------------------

    process_tracks(track_ids)

    # -------------------------
    # DRAW RESULTS
    # -------------------------

    annotated = results[0].plot()

    if results[0].boxes.id is not None:

        boxes = results[0].boxes

        for i in range(len(boxes)):

            track_id = int(
                boxes.id[i]
                .cpu()
                .numpy()
            )

            label = recognized_tracks.get(
                track_id,
                "Unknown"
            )

            x1, y1, _, _ = (
                boxes.xyxy[i]
                .cpu()
                .numpy()
            )

            cv2.putText(
                annotated,
                str(label),
                (
                    int(x1),
                    int(y1) - 10
                ),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 0),
                2
            )

    # -------------------------
    # RESTRICTED ZONE
    # -------------------------

    cv2.rectangle(
        annotated,
        (ZONE_X1, ZONE_Y1),
        (ZONE_X2, ZONE_Y2),
        (0, 0, 255),
        2
    )

    cv2.putText(
        annotated,
        "RESTRICTED ZONE",
        (
            ZONE_X1,
            ZONE_Y1 - 10
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0, 0, 255),
        2
    )

    cv2.imshow(
        "AI Surveillance Platform",
        annotated
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()