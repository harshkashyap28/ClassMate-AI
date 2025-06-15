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
    # Truncate content to avoid exceeding API limits
    max_content_length = 5000  # Adjust based on API limits
    truncated_content = content[:max_content_length]

    # Create a more specific prompt
    prompt = f"""
    Generate {num_questions} multiple-choice quiz questions from the following text:
    Difficulty: {difficulty}
    
    {truncated_content}
    
    **Instructions:**
    1. Each question must start with "Q:" followed by the question text.
    2. Provide exactly 4 options for each question, labeled A), B), C), and D).
    3. Each option must be on a new line.
    4. The correct answer must start with "Answer:" followed by the correct option (A, B, C, or D).
    5. Do not include any additional text, explanations, or formatting outside the specified format.
    
    **Example:**
    Q: What is the capital of France?
    A) London
    B) Paris
    C) Berlin
    D) Madrid
    Answer: B
    """

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-002")
        response = model.generate_content(prompt)
        
        # Clean the response to remove unwanted text
        cleaned_response = "\n".join(
            line for line in response.text.split("\n")
            if line.startswith("Q:") or line.startswith("A)") or line.startswith("B)") or line.startswith("C)") or line.startswith("D)") or line.startswith("Answer:")
        )
        return cleaned_response
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return "Error generating quiz"

# Flask route to handle quiz generation
@app.route("/generate-quiz/pdf", methods=["POST"])
def generate_pdf_quiz():
    # Check if a file was uploaded
    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # Save the uploaded file
    pdf_file = request.files["pdf"]
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_file.filename)
    pdf_file.save(pdf_path)

    # Extract text from the PDF (no logging of PDF content)
    extracted_text = extract_text_from_pdf(pdf_path)
    os.remove(pdf_path)  # Clean up the uploaded file

    # Check if text extraction was successful
    if not extracted_text:
        return jsonify({"error": "No text extracted from PDF"}), 400

    # Get the number of questions and difficulty level from the form
    num_questions = int(request.form.get("numQuestions", 5))
    difficulty = request.form.get("difficulty", "Easy")

    # Generate the quiz using the Gemini API (no logging of quiz content)
    quiz = generate_quiz(extracted_text, num_questions, difficulty)

    # Check if quiz generation was successful
    if quiz == "Error generating quiz":
        return jsonify({"error": "Failed to generate quiz. Please try again."}), 500

    # Return the generated quiz
    return jsonify({"quiz": quiz})

# Run the Flask app
if __name__ == "__main__":
    # Enable Flask server logs (startup and API calls)
    logging.getLogger("werkzeug").setLevel(logging.INFO)  # Show INFO-level logs
    app.run(port=5002, debug=True, use_reloader=False)
