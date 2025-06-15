from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import fitz
import google.generativeai as genai
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter


load_dotenv()

app = Flask(__name__)
CORS(app)

TEMP_DIR = "temp"
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Adding Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file using PyMuPDF."""
    doc = fitz.open(pdf_path)
    text = " ".join([page.get_text("text") for page in doc])
    return text, len(doc)  # Return extracted text and number of pages

def chunk_text(text):
    """Spliting text into smaller chunks for efficient processing."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=3000, chunk_overlap=500, length_function=len
    )
    return text_splitter.split_text(text)

def clean_summary(text):
    """Removing the unwanted * or - at the start of lines and extra spaces"""
    cleaned_text = re.sub(r"^\s*[\*\-]\s*", "", text, flags=re.MULTILINE)
    return cleaned_text.strip()

def generate_summary(text_chunks):
    model = genai.GenerativeModel("models/gemini-1.5-flash-002")

    summaries = []
    for chunk in text_chunks:
        prompt = f"Summarize this academic content concisely in a single paragraph without using bullet points:\n\n{chunk}"
        response = model.generate_content(prompt)
        cleaned_text = clean_summary(response.text)  # Clean up unwanted characters
        summaries.append(cleaned_text)

    return " ".join(summaries)  # Combine all chunk summaries into one paragraph

@app.route('/summarize', methods=['POST'])
def summarize():
    """Handles PDF upload, extracts text, summarizes it, and returns a response."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    pdf_path = os.path.join(TEMP_DIR, file.filename)
    file.save(pdf_path)

    try:
        extracted_text, num_pages = extract_text_from_pdf(pdf_path)
        text_chunks = chunk_text(extracted_text)
        summary = generate_summary(text_chunks)

        return jsonify({"summary": summary, "num_pages": num_pages}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

if __name__ == '__main__':
    app.run(port= 5001,debug=True, threaded=True)
