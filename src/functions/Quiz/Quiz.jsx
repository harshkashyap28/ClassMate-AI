import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import HomeHeader from "../Home/HomeHeader";
import "./Quiz.css";

const Quiz = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("Easy");
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const formatQuizData = (quizString) => {
    return quizString.split("\n").reduce((acc, line) => {
      if (line.startsWith("Q:")) {
        acc.push({ question: line, options: [], answer: "" });
      } else if (line.match(/^[A-D]\)/)) {
        acc[acc.length - 1].options.push(line);
      } else if (line.startsWith("Answer:")) {
        acc[acc.length - 1].answer = line.split(": ")[1];
      }
      return acc;
    }, []);
  };

  const handleGenerateQuiz = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("numQuestions", numQuestions);
    formData.append("difficulty", difficulty);

    try {
      const response = await axios.post("http://127.0.0.1:5000/generate-quiz/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const formattedQuiz = formatQuizData(response.data.quiz);
      setQuiz(formattedQuiz);
      setQuizGenerated(true);
    } catch (error) {
      alert("Error generating quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true); // Show results page
  };

  const handleRetryQuiz = () => {
    setQuizGenerated(false);
    setQuizStarted(false);
    setShowResults(false);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Results Page
  if (showResults) {
    return (
      <div className="quiz-page">
        <HomeHeader />
        <div className="container quiz-container">
          <h2 className="title text-center mb-4">📝 Quiz Results</h2>
          <div className="results-card p-4">
            <div className="results-content">
              {quiz.map((question, index) => (
                <div key={index} className="mb-4">
                  <h5>{question.question}</h5>
                  <p><strong>Your Answer:</strong> {userAnswers[index] || "Not answered"}</p>
                  <p><strong>Correct Answer:</strong> {question.answer}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleRetryQuiz}
              className="btn btn-primary w-100 mt-4"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <HomeHeader />
      <div className="container quiz-container">
        <h2 className="title text-center mb-4">📝 Quiz Generator</h2>

        {!quizGenerated ? (
          <form onSubmit={(e) => e.preventDefault()} className="upload-form">
            <div className="upload-area"> {/* New upload area */}
              <label htmlFor="fileInput" className="file-label">
                <i className="fas fa-upload"></i> {/* Upload icon */}
                <span>Upload PDF</span> {/* Upload text */}
              </label>
              <input
                type="file"
                id="fileInput"
                accept="application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            <div className="input-group">
              <label>Number of Questions:</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min="1"
                className="quiz-input"
              />
            </div>

            <div className="input-group">
              <label>Difficulty Level:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="quiz-select"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="btn upload-btn"
            >
              {loading ? <div className="spinner"></div> : "Generate Quiz"} {/* Spinner */}
            </button>
          </form>
        ) : !quizStarted ? (
          <button
            onClick={() => setQuizStarted(true)}
            className="btn start-btn w-100"
          >
            Start Quiz
          </button>
        ) : (
          <div className="quiz-content">
            <div className="quiz-card p-4">
              <h3 className="mb-4">{quiz[currentQuestionIndex].question}</h3>
              {quiz[currentQuestionIndex].options.map((option, i) => (
                <div key={i} className="form-check mb-3">
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option[0]}
                    checked={userAnswers[currentQuestionIndex] === option[0]}
                    onChange={() => handleAnswerSelect(currentQuestionIndex, option[0])}
                    className="form-check-input"
                    id={`option-${currentQuestionIndex}-${i}`} 
                  />
                  <label htmlFor={`option-${currentQuestionIndex}-${i}`} className="form-check-label">{option}</label> {/* Connect label with input */}

                </div>
              ))}
            </div>
            <div className="quiz-navigation d-flex justify-content-between mt-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === quiz.length - 1}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
            {currentQuestionIndex === quiz.length - 1 && (
              <button
                onClick={handleSubmitQuiz}
                className="btn btn-success w-100 mt-4"
              >
                Submit Quiz
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;