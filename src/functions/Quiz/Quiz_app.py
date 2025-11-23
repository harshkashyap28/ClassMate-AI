from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import fitz  # PyMuPDF
import google.generativeai as genai
import logging

load_dotenv()
app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Set up Google Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    try:
        doc = fitz.open(pdf_path)
        text = " ".join([page.get_text("text") for page in doc])
        return text if text.strip() else None
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

# Function to generate quiz using Gemini API
def generate_quiz(content, num_questions, difficulty):
    max_content_length = 5000
    truncated_content = content[:max_content_length]

    prompt = f"""
    Generate {num_questions} multiple-choice quiz questions from the following text:
    Difficulty: {difficulty}
    
    {truncated_content}
    
    **Instructions:**
    1. Each question must start with "Q:" followed by the question text.
    2. Provide exactly 4 options for each question, labeled A), B), C), and D).
    3. Each option must be on a new line.
    4. The correct answer must start with "Answer:" followed by the correct option letter.
    """

    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)

        cleaned_response = "\n".join(
            line for line in response.text.split("\n")
            if line.startswith(("Q:", "A)", "B)", "C)", "D)", "Answer:"))
        )
        return cleaned_response

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return "Error generating quiz"

# Flask route to handle quiz generation
@app.route("/generate-quiz/pdf", methods=["POST"])
def generate_pdf_quiz():
    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files["pdf"]
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_file.filename)
    pdf_file.save(pdf_path)

    extracted_text = extract_text_from_pdf(pdf_path)
    os.remove(pdf_path)

    if not extracted_text:
        return jsonify({"error": "No text extracted from PDF"}), 400

    num_questions = int(request.form.get("numQuestions", 5))
    difficulty = request.form.get("difficulty", "Easy")

    quiz = generate_quiz(extracted_text, num_questions, difficulty)

    if quiz == "Error generating quiz":
        return jsonify({"error": "Failed to generate quiz. Please try again."}), 500

    return jsonify({"quiz": quiz})

# Run the Flask app
if __name__ == "__main__":
    logging.getLogger("werkzeug").setLevel(logging.INFO)
    app.run(port=5002, debug=True, use_reloader=False)
