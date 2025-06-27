# app.py (Flask backend)
from flask import Flask, jsonify, request, send_from_directory
import cv2
import os
from datetime import datetime

app = Flask(__name__)

# Path to store selfies
PHOTO_DIR = 'attendance_photos'
if not os.path.exists(PHOTO_DIR):
    os.makedirs(PHOTO_DIR)

@app.route('/mark-attendance', methods=['POST'])
def mark_attendance():
    device_data = request.json
    device_name = device_data.get('device_name')
    print(f"Device connected: {device_name}")

    # Trigger selfie capture (Use OpenCV to capture a photo)
    camera = cv2.VideoCapture(0)  # Open the default camera (0 is the default camera)
    ret, frame = camera.read()
    if ret:
        # Save selfie with timestamp to avoid overwriting files
        photo_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_attendance.jpg"
        photo_path = os.path.join(PHOTO_DIR, photo_filename)
        cv2.imwrite(photo_path, frame)
    camera.release()

    # Return the path to the selfie image
    return jsonify({
        'status': 'attendance marked',
        'photo': photo_filename
    })

# Route to serve the selfie image
@app.route('/attendance_photos/<filename>')
def get_photo(filename):
    return send_from_directory(PHOTO_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
