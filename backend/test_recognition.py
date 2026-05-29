from app.services.face_recognition import identify_face

result = identify_face(
    "../data/face_registry/person1.jpg"
)

print(result)