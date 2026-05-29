import os
from deepface import DeepFace

FACE_DIR = "../data/face_registry"

known_faces = {}


def load_faces():

    global known_faces

    known_faces = {}

    for file in os.listdir(FACE_DIR):

        if file.endswith(".jpg") or file.endswith(".png"):

            path = os.path.join(FACE_DIR, file)

            embedding = DeepFace.represent(
                img_path=path,
                model_name="Facenet512",
                enforce_detection=False
            )[0]["embedding"]

            name = os.path.splitext(file)[0]

            known_faces[name] = embedding

    print(f"Loaded {len(known_faces)} faces")

    return known_faces