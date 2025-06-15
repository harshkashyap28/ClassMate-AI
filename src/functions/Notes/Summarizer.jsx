import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import HomeHeader from "../Home/HomeHeader";
import "./Summarizer.css";

const Summarizer = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [isSummarising, setIsSummarising] = useState(false);
  const [pdfURL, setPdfURL] = useState(null);
  const [showUpload, setShowUpload] = useState(true);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setPdfURL(URL.createObjectURL(uploadedFile));
  }; 

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please upload a file first!");
      return;
    }
    setIsSummarising(true);
    setShowUpload(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5001/summarize", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary);
      } else {
        alert(data.error || "Failed to summarize");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while summarizing.");
    } finally {
      setIsSummarising(false);
    }
  };

  const handleSummarizeAgain = () => {
    setFile(null);
    setSummary("");
    setPdfURL(null);
    setShowUpload(true);
  };

  return (
    <div className="summarizer-page">
      <HomeHeader />
      <div className="container summarizer-container">
        <h2 className="title">📖 PDF Summarizer</h2>

        {/* Upload Section */}
        {showUpload && (
          <form onSubmit={handleSubmit} className="upload-form">
            <label htmlFor="fileInput" className="file-label">Upload PDF</label>
            <input type="file" id="fileInput" accept=".pdf" onChange={handleFileChange} className="file-input" />
            <button type="submit" className="btn upload-btn">Summarize</button>
          </form>
        )}

        {/* Display Content Section after Upload */}
        {pdfURL && (
          <div className="content-wrapper">
            {/* PDF Viewer */}
            <div className="pdf-viewer">
              <iframe src={pdfURL} className="pdf-frame" title="Uploaded PDF"></iframe>
            </div>

            {/* Summary Box */}
            <div className="summary-box">
              {isSummarising ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p className="loading-text">Summarizing...</p>
                </div>
              ) : summary ? (
                <>
                  <h4 className="summary-title">📑 Summary:</h4>
                  <div className="summary-content">
                    {summary.split(". ").map((point, index) => (
                      <p key={index} className="summary-point">• {point}</p>
                    ))}
                  </div>
                  <button className="btn reset-btn" onClick={handleSummarizeAgain}>Summarize Again</button>
                </>
              ) : (
                <p className="placeholder-text">Your summary will appear here...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
