import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { RotateCcw, Check, X, Loader, AlertCircle } from "lucide-react";
import useSpeciesRecognition from "../hooks/useSpeciesRecognition";
import "../styles/SpeciesScanner.css";

function WebcamCapture(props) {
  const {
    addObservation,
    onCapture,
    geoFindMe,
    onCancel,
    id,
    photoedTask,
    onSaved,
  } = props;
  // 1. Prepare Hooks
  const webcamRef = useRef(null);
  const controlsRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgId, setImgId] = useState(null);
  const [photoSave, setPhotoSave] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [webcamKey, setWebcamKey] = useState(0);
  const [facingMode, setFacingMode] = useState("environment");

  console.log("WebCamCapture", props.id);

  const submitObservation = typeof addObservation === "function" ? addObservation : onCapture;

  const dismissKeyboard = useCallback(() => {
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
    window.scrollTo(0, 0);
  }, []);
  
  const { classifyImage, isReady, isLoading, error: modelError } = useSpeciesRecognition();

  useEffect(() => {
    dismissKeyboard();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not supported. Please use HTTPS or a modern browser.");
    }
  }, [dismissKeyboard]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateViewportOffset = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.documentElement.style.setProperty("--scanner-vv-offset", `${offset}px`);
    };

    updateViewportOffset();
    viewport.addEventListener("resize", updateViewportOffset);
    viewport.addEventListener("scroll", updateViewportOffset);

    return () => {
      viewport.removeEventListener("resize", updateViewportOffset);
      viewport.removeEventListener("scroll", updateViewportOffset);
      document.documentElement.style.setProperty("--scanner-vv-offset", "0px");
    };
  }, []);

  useEffect(() => {
  function updateControlsHeight() {
    const controlsHeight = controlsRef.current?.offsetHeight || 0;
    document.documentElement.style.setProperty(
      "--scanner-controls-height",
      `${controlsHeight}px`
    );
  }

  updateControlsHeight();
  window.addEventListener("resize", updateControlsHeight);

  return () => {
    window.removeEventListener("resize", updateControlsHeight);
    document.documentElement.style.setProperty("--scanner-controls-height", "0px");
  };
}, [imgSrc, isAnalyzing, isReady, isLoading, error, modelError]);

  useEffect(() => {
    if (!showSavedToast) return;
    const timer = window.setTimeout(() => setShowSavedToast(false), 1800);
    return () => window.clearTimeout(timer);
  }, [showSavedToast]);

  // 2. Listen for save state and notify parent callback
  useEffect(() => {
    if (photoSave) {
      console.log("useEffect detected photoSave");
      if (imgId && typeof photoedTask === "function") {
        photoedTask(imgId);
      } else if (imgId && typeof onSaved === "function") {
        window.setTimeout(() => onSaved(imgId), 350);
      }
      setPhotoSave(false);
    }
  }, [photoSave, imgId, photoedTask, onSaved]);

  function handleUserMedia() {
    setCameraReady(true);
    setError(null);
  }

  function handleUserMediaError(err) {
    setCameraReady(false);
    if (err?.name === "NotAllowedError") {
      setError("Please allow camera access. Check browser settings if needed.");
    } else if (err?.name === "NotFoundError") {
      setError("No camera detected on this device.");
    } else if (err?.name === "NotSupportedError" || err?.name === "TypeError") {
      setError("Camera not supported. HTTPS may be required on this device.");
    } else {
      setError("Unable to access camera. Try refreshing the page.");
    }
  }

  function retryCameraAccess() {
    setError(null);
    setCameraReady(false);
    setWebcamKey((prev) => prev + 1);
  }

  function toggleCameraFacing() {
    setError(null);
    setCameraReady(false);

    const stream = webcamRef.current?.video?.srcObject;
    if (stream && typeof stream.getTracks === "function") {
      stream.getTracks().forEach((track) => track.stop());
    }

    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    setWebcamKey((prev) => prev + 1);
  }

  function buildUnknownObservation(imgSrcValue) {
    return {
      photo: imgSrcValue,
      species: "Unknown Species",
      confidence: 0,
      allPredictions: [],
    };
  }

  async function persistObservation(payload) {
    if (typeof submitObservation !== "function") {
      throw new Error("Observation handler is unavailable");
    }

    const createdId = await Promise.resolve(submitObservation(payload));
    setImgId(createdId);
    setPhotoSave(true);
    setShowSavedToast(true);
  }

  // 3. Capture callback
  const capture = useCallback((id) => {
    dismissKeyboard();
    const imageSrc = webcamRef.current?.getScreenshot?.();
    if (!imageSrc) {
      setError("Unable to capture photo. Try again.");
      return;
    }
    setImgSrc(imageSrc);
    console.log("capture", imageSrc.length, id);
  }, [dismissKeyboard]);

  // 4. Save photo and observation
  async function savePhoto(id, imgSrcValue) {
    dismissKeyboard();
    if (!imgSrcValue) return;

    console.log("savePhoto", id, imgSrcValue.length);

    setIsAnalyzing(true);
    setError(null);

    const unknownObservation = buildUnknownObservation(imgSrcValue);

    try {
      if (isReady) {
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("Failed to prepare captured image"));
          image.src = imgSrcValue;
        });

        const predictions = await classifyImage(img);
        
        if (predictions && predictions.length > 0) {
          await persistObservation({
            photo: imgSrcValue,
            species: predictions[0].species,
            confidence: predictions[0].confidence,
            allPredictions: predictions,
          });
          return;
        }
      }
      
      await persistObservation(unknownObservation);
      
    } catch (err) {
      if (typeof submitObservation !== "function") {
        setError("Unable to save observation. Please refresh and try again.");
        return;
      }
      await persistObservation(unknownObservation);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function cancelPhoto(id, imgSrcValue) {
    console.log("cancelPhoto", id, imgSrcValue ? imgSrcValue.length : 0);
    setImgSrc(null);
    setError(null);
  }

  return (
    <div className="species-scanner">
      <div className="scanner-header">
        <h2>Scan Wildlife</h2>
        <button className="btn-icon" onClick={onCancel} aria-label="Close">
          <X size={24} />
        </button>
      </div>

      <div className="scanner-viewport">
        {!imgSrc ? (
          <Webcam
            key={`${webcamKey}-${facingMode}`}
            audio={false}
            ref={webcamRef}
            mirrored={facingMode === "user"}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            videoConstraints={{
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleUserMediaError}
            className="camera-preview"
          />
        ) : (
          <img src={imgSrc} alt="Captured" className="captured-image" />
        )}

        {!imgSrc && !cameraReady && !error && (
          <div className="loading-overlay">
            <Loader className="spinner" size={32} />
            <p>Starting camera...</p>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-card">
              <AlertCircle size={48} />
              <h3>Camera Access Required</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={retryCameraAccess}>
                <RotateCcw size={20} />
                Retry Camera Access
              </button>
              <div className="error-card-help">
                <div className="error-card-help-title">Need Help?</div>
                <div className="error-card-help-text">
                  Chrome: Tap the lock icon in address bar → Site settings → Camera → Allow
                </div>
              </div>
            </div>
          </div>
        )}
        
        {modelError && (
          <div className="warning-toast">
            <AlertCircle size={16} />
            <span>{modelError}</span>
          </div>
        )}

        {showSavedToast && (
          <div className="success-toast" role="status" aria-live="polite">
            <Check size={16} />
            <span>Recognized and saved</span>
          </div>
        )}
      </div>

      <div className="scanner-controls" ref={controlsRef}>
        {!imgSrc ? (
          <>
            <div className="ai-status">
              {isLoading ? (
                <><Loader className="spinner-small" size={16} /> Loading AI model...</>
              ) : isReady ? (
                <><Check size={16} /> AI Ready</>
              ) : (
                <><AlertCircle size={16} /> AI Unavailable</>
              )}
            </div>
            <div className="btn-group">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={toggleCameraFacing}
                disabled={!cameraReady || !!error}
                aria-label="Switch camera"
              >
              <RotateCcw size={16} />
              {facingMode === "environment" ? "Front camera" : "Rear camera"}
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => capture(id)}
                disabled={!cameraReady || !!error}
                aria-label="Capture photo"
              >
              Capture photo
            </button>
          </div>
            <div className="ai-status" style={{ opacity: 0 }}>Placeholder</div>
          </>
        ) : (
          <div className="btn-group btn-group--stacked">
            {/* 6. Conditional rendering: photo captured */}
            <button
              type="button"
              className="btn"
              onClick={() => savePhoto(id, imgSrc)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <><Loader className="spinner-small" size={20} /> {isReady ? "Analyzing..." : "Saving..."}</>
              ) : (
                "Save photo"
              )}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => cancelPhoto(id, imgSrc)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WebcamCapture;
