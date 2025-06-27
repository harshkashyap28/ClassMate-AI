import subprocess
import os

# Define the paths to your Python scripts
summarizer_app_path = "/Users/harshkumar/mac/Final Year project/CLASSMATE AI/ClassMate Ai/src/functions/Notes/Summarizer_app.py"
quiz_app_path = "/Users/harshkumar/mac/Final Year project/CLASSMATE AI/ClassMate Ai/src/functions/Quiz/Quiz_app.py"
attendance_app_path = "/Users/harshkumar/mac/Final Year project/CLASSMATE AI/ClassMate Ai/src/functions/Attendance/face.py"

# Start the summarizer_app.py
summarizer_process = subprocess.Popen(['python', summarizer_app_path])

# Start the quiz_app.py
quiz_process = subprocess.Popen(['python', quiz_app_path])

# Start the face.py (Attendance)
attendance_process = subprocess.Popen(['python', attendance_app_path])
 
# Optionally wait for all processes to finish
summarizer_process.wait()
quiz_process.wait()
attendance_process.wait()
