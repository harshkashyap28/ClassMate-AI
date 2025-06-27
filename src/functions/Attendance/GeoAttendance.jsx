import React, { useState, useEffect, useRef, useCallback } from 'react';
import './css/geolocation.css';
import { ref, uploadString } from "firebase/storage";
import { storage, auth } from "../../functions/Authentication/firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faCheckCircle, faMapMarkerAlt, faRedo, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import HomeHeader from "../Home/HomeHeader";

const classroomLocation = {
  latitude: 12.935269,
  longitude: 77.534787,
};

const RADIUS_METERS = 30000; // set to 3km for testing purposes make sure to change it to 0.10 km or less 
const MAX_ATTEMPTS = 3;

const GeoAttendance = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [currentStep, setCurrentStep] = useState(1); // 1: location, 2: face, 3: mark
  const [faceVerificationStatus, setFaceVerificationStatus] = useState(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Error accessing camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureSelfie = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setError('Camera not ready. Please wait...');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(-1, 1); // mirror image
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    setSelfie(dataUrl);
  };

  const verifyFace = async (selfieDataUrl) => {
    setVerificationInProgress(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5003/verify-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          selfie: selfieDataUrl.split(',')[1]
        })
      });

      const result = await response.json();
      if (response.ok && result.match) {
        setFaceVerificationStatus(true);
        setCurrentStep(3); // Move to mark attendance step
        return true;
      } else {
        setError(result.error || 'Face verification failed. Please try again.');
        setFaceVerificationStatus(false);
        return false;
      }
    } catch (err) {
      console.error(err);
      setError('Verification service error. Please try again.');
      return false;
    } finally {
      setVerificationInProgress(false);
    }
  };

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError('');

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const toRad = (value) => (value * Math.PI) / 180;
      const R = 6371e3;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    if (!navigator.geolocation) {
      setError('Geolocation not supported.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(latitude, longitude, classroomLocation.latitude, classroomLocation.longitude);

        setUserLocation({ latitude, longitude });

        if (distance <= RADIUS_METERS) {
          setCurrentStep(2); // Move to face verification step
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          setError(`You are not within ${RADIUS_METERS/1000}km of the classroom. Attempts left: ${MAX_ATTEMPTS - newAttempts}`);
        }
        setLoading(false);
      },
      (err) => {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(`Location error. Attempts left: ${MAX_ATTEMPTS - newAttempts}. ${err.message}`);
        setLoading(false);
      }
    );
  }, [attempts]);

  const markAttendance = async () => {
    if (!selfie || !userLocation) {
      setError("Selfie or location missing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userId = auth.currentUser.uid;
      const timestamp = new Date().toISOString();
      const path = `attendance_selfies/${userId}/${timestamp}.png`;
      const imgRef = ref(storage, path);
      await uploadString(imgRef, selfie, "data_url");
      
      setAttendanceMarked(true);
      stopCamera();
      setIsCameraOpen(false);
    } catch (err) {
      setError("Error marking attendance: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    stopCamera();
    setAttempts(0);
    setError('');
    setUserLocation(null);
    setSelfie(null);
    setCurrentStep(1);
    setFaceVerificationStatus(null);
    setIsCameraOpen(false);
    setAttendanceMarked(false);
  };

  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen]);

  return (
    <div className="geolocation-container">
      <HomeHeader />
      <div className="attendance-card">
        <h1 className="title">Geo Location Attendance</h1>
        
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Verify Location</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Face Verification</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Mark Attendance</div>
          </div>
        </div>

        {error && (
          <div className={`error-message ${attempts >= MAX_ATTEMPTS ? 'error-max' : ''}`}>
            {error}
            {attempts >= MAX_ATTEMPTS && (
              <button onClick={resetVerification} className="button try-again">
                <FontAwesomeIcon icon={faRedo} /> Reset
              </button>
            )}
          </div>
        )}

        {loading && <div className="loading-spinner"></div>}

        {!attendanceMarked ? (
          <div className="step-content">
            {/* Step 1: Location Verification */}
            {currentStep === 1 && (
              <div className="location-step">
                <div className="location-icon">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <h2>Verify Your Location</h2>
                <p>You must be within {RADIUS_METERS/1000}km of the classroom to mark attendance.</p>
                <p>Attempts left: {MAX_ATTEMPTS - attempts}</p>
                <button
                  onClick={requestLocation}
                  className="button primary"
                  disabled={loading || attempts >= MAX_ATTEMPTS}
                >
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Verify Location
                </button>
              </div>
            )}

            {/* Step 2: Face Verification */}
            {currentStep === 2 && (
              <div className="face-step">
                <div className="face-icon">
                  <FontAwesomeIcon icon={faUserCheck} />
                </div>
                <h2>Verify Your Identity</h2>
                <p>Capture a selfie to verify your identity.</p>
                
                {!isCameraOpen ? (
                  <button 
                    onClick={() => setIsCameraOpen(true)} 
                    className="button primary"
                  >
                    <FontAwesomeIcon icon={faCamera} /> Open Camera
                  </button>
                ) : (
                  <div className="camera-section">
                    <video ref={videoRef} className="video-feed" autoPlay playsInline></video>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    
                    <div className="camera-controls">
                      <button onClick={captureSelfie} className="button secondary">
                        <FontAwesomeIcon icon={faCamera} /> Capture
                      </button>
                      
                      {selfie && (
                        <>
                          <div className="selfie-preview">
                            <img src={selfie} alt="Selfie preview" />
                          </div>
                          <button 
                            onClick={() => verifyFace(selfie)} 
                            className="button primary"
                            disabled={verificationInProgress}
                          >
                            {verificationInProgress ? (
                              'Verifying...'
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faUserCheck} /> Verify Face
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Mark Attendance */}
            {currentStep === 3 && (
              <div className="mark-step">
                <div className="check-icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <h2>Ready to Mark Attendance</h2>
                <p>Your location and identity have been verified.</p>
                
                {selfie && (
                  <div className="final-preview">
                    <img src={selfie} alt="Verified selfie" />
                  </div>
                )}
                
                <button
                  onClick={markAttendance}
                  className="button success"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Mark Attendance'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="success-screen">
            <div className="success-icon">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
              </svg>
            </div>
            <h2>Attendance Marked Successfully!</h2>
            <p>Your attendance has been recorded with location and photo verification.</p>
            <button onClick={resetVerification} className="button">
              <FontAwesomeIcon icon={faRedo} /> Mark Again
            </button>
          </div>
        )}
        {faceVerificationStatus === true && (
  <p className="success-message">Face verified successfully!</p>
)}
{faceVerificationStatus === false && (
  <p className="error-message">Face verification failed. Please try again.</p>
)}

      </div>
    </div>
  );
};

export default GeoAttendance;