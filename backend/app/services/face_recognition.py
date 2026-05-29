from deepface import DeepFace
import os

# -------------------------
# Face Registry
# -------------------------

FACE_DB = {}


def load_face_registry():

    global FACE_DB

    registry_path = "../data/face_registry"

    for file in os.listdir(registry_path):

        if file.lower().endswith(
            (".jpg", ".jpeg", ".png")
        ):

            person_name = os.path.splitext(
                file
            )[0]

            FACE_DB[person_name] = (
                os.path.join(
                    registry_path,
                    file
                )
            )

    print(
        f"Loaded {len(FACE_DB)} faces"
    )

    print(
        "Known persons:",
        list(FACE_DB.keys())
    )


# -------------------------
# Face Identification
# -------------------------

def identify_face(face_image_path):

    best_match = "Unknown"
    best_distance = 999

    try:

        for person_name, image_path in FACE_DB.items():

            result = DeepFace.verify(
                img1_path=face_image_path,
                img2_path=image_path,
                model_name="VGG-Face",
                enforce_detection=False
            )

            distance = result["distance"]

            if distance < best_distance:

                best_distance = distance
                best_match = person_name

        # Threshold tuned for
        # full-body YOLO crops

        if best_distance < 0.65:

            return best_match

        return "Unknown"

    except Exception as e:

        print(
            "Face Recognition Error:",
            e
        )

        return "Unknown"


# -------------------------
# Auto Load Registry
# -------------------------

load_face_registry()