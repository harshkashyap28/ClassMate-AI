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
  const [timer, setTimer] = useState(10);
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
        acc.push({ question: line.replace("Q:", "").trim(), options: [], answer: "" });
      } else if (line.match(/^[A-D]\)/)) {
        acc[acc.length - 1].options.push(line.substring(3).trim());
      } else if (line.startsWith("Answer:")) {
        const correctOptionIndex = ["A", "B", "C", "D"].indexOf(line.split(": ")[1].trim());
        acc[acc.length - 1].answer = acc[acc.length - 1].options[correctOptionIndex];
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
    setTimer(10);

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("numQuestions", numQuestions);
    formData.append("difficulty", difficulty);

    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
        }
        return prev - 1;
      });
    }, 1000);

    try {
      const response = await axios.post("http://127.0.0.1:5002/generate-quiz/pdf", formData, {
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
    setShowResults(true);
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
            {quiz.map((question, index) => (
              <div key={index} className="mb-4">
                <h5>{question.question}</h5>
                <p><strong>Your Answer:</strong> {userAnswers[index] || "Not answered"}</p>
                <p><strong>Correct Answer:</strong> {question.answer}</p>
              </div>
            ))}
            <button onClick={handleRetryQuiz} className="btn btn-primary w-100 mt-4">
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
            <label className="file-label">Upload PDF</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="file-input"
            />

            <div className="quiz-settings-row">
              <div className="setting-group">
                <label>Number of Questions:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="setting-input"
                />
              </div>

              <div className="setting-group">
                <label>Difficulty Level:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="setting-select"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button onClick={handleGenerateQuiz} disabled={loading} className="upload-btn">
              {loading ? <div className="spinner">⏳ {timer}s</div> : "Generate Quiz"}
            </button>
          </form>
        ) : quizStarted ? (
          <div className="quiz-content">
            <h3>{quiz[currentQuestionIndex].question}</h3>
            <div className="quiz-options">
              {quiz[currentQuestionIndex].options.map((option, i) => (
                <div key={i} className="quiz-option">
                  <input
                    type="radio"
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={userAnswers[currentQuestionIndex] === option}
                    onChange={() => handleAnswerSelect(currentQuestionIndex, option)}
                    id={`option-${i}`}
                  />
                  <label htmlFor={`option-${i}`} className="option-text">
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <div className="quiz-navigation">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="btn btn-secondary">
                Previous
              </button>
              <button onClick={handleNextQuestion} disabled={currentQuestionIndex === quiz.length - 1} className="btn btn-secondary">
                Next
              </button>
              {currentQuestionIndex === quiz.length - 1 && (
                <button onClick={handleSubmitQuiz} className="btn btn-success">
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => setQuizStarted(true)} className="btn btn-success w-100 start-btn">
            Start Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
