from app.services.face_registry import load_faces

faces = load_faces()

print(faces.keys())