from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/api/add-to-calendar', methods=['POST'])
def add_to_calendar():
    try:
        data = request.json
        access_token = data.get("accessToken")
        assignment = data.get("assignment")

        if not access_token or not assignment:
            return jsonify({"error": "Missing accessToken or assignment"}), 400

        event = {
            "summary": assignment.get("title"),
            "description": assignment.get("description", f"Subject: {assignment.get('subject', '')}"),
            "start": {
                "dateTime": assignment.get("dueDate"),
                "timeZone": "Asia/Kolkata"
            },
            "end": {
                "dateTime": assignment.get("endDateTime"),  # Pass this from frontend 
                "timeZone": "Asia/Kolkata"
            }
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        response = requests.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers=headers,
            json=event
        )

        if response.status_code == 200 or response.status_code == 201:
            return jsonify({"success": True, "event": response.json()}), 200
        else:
            return jsonify({"error": response.json()}), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
