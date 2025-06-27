import os
import base64
import tempfile
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Important if you're using cookies or auth headers

# Load Firebase credentials
FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH")
if not FIREBASE_CRED_PATH:
    raise ValueError("Missing FIREBASE_CRED_PATH in .env")

cred = credentials.Certificate(FIREBASE_CRED_PATH)
initialize_app(cred)
db = firestore.client()

# Face++ API configuration
FACE_API_URL = "https://api-us.faceplusplus.com/facepp/v3/compare"
API_KEY = os.getenv("FACE_API_KEY")
API_SECRET = os.getenv("FACE_API_SECRET")

if not API_KEY or not API_SECRET:
    raise ValueError("Missing FACE_API_KEY or FACE_API_SECRET in .env")

# Get profile picture URL from Firestore
def get_user_profile_picture(user_id):
    doc_ref = db.collection("users").document(user_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get("profilePicture")
    return None

# Face verification endpoint
@app.route('/verify-face', methods=['POST', 'OPTIONS'])
def verify_face():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'CORS preflight successful'}), 200

    try:
        data = request.json
        user_id = data.get("userId")
        selfie_base64 = data.get("selfie")

        if not user_id or not selfie_base64:
            return jsonify({"error": "Missing userId or selfie"}), 400

        image_url1 = get_user_profile_picture(user_id)
        if not image_url1:
            return jsonify({"error": "Profile picture not found"}), 404

        # Decode base64 and save selfie
        selfie_data = base64.b64decode(selfie_base64)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(selfie_data)
            selfie_path = temp_file.name

        # Make API call to Face++
        with open(selfie_path, 'rb') as f:
            response = requests.post(
                FACE_API_URL,
                data={
                    "api_key": API_KEY,
                    "api_secret": API_SECRET,
                    "image_url1": image_url1
                },
                files={"image_file2": f}
            )

        result = response.json()
        if "error_message" in result:
            return jsonify({"error": result["error_message"]}), 400

        confidence = result.get("confidence", 0)
        threshold = result.get("thresholds", {}).get("1e-3", 75.0)
        return jsonify({
            "confidence": confidence,
            "threshold": threshold,
            "match": confidence >= threshold
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Start server on port 5003
if __name__ == '__main__':
    app.run(debug=True, port=5003)
