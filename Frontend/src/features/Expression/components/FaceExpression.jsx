import { useEffect, useRef, useState } from "react";
import { init, detect } from "../utils/utils";
import { useSong } from "../../../home/hooks/useSong";

const expressionMood = {
  happy: "happy",
  sad: "sad",
  angry: "angry",
  relaxed: "relaxed",
  neutral: "relaxed",
  surprised: "happy",
};

export default function FaceExpression() {
  const { loading, handleGetSong } = useSong();
  const videoRef = useRef(null);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const detectingRef = useRef(false);
  const candidateMoodRef = useRef(null);
  const candidateFramesRef = useRef(0);
  const activeMoodRef = useRef(null);

  const [expression, setExpression] = useState("Initializing...");
  const [error, setError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  function handleExpressionDetected(detectedExpression) {
    const mood = expressionMood[detectedExpression.toLowerCase()];

    if (!mood) {
      candidateMoodRef.current = null;
      candidateFramesRef.current = 0;
      return;
    }

    if (candidateMoodRef.current !== mood) {
      candidateMoodRef.current = mood;
      candidateFramesRef.current = 1;
      return;
    }

    candidateFramesRef.current += 1;

    if (candidateFramesRef.current < 12 || activeMoodRef.current === mood) {
      return;
    }

    activeMoodRef.current = mood;
    setError("");

    handleGetSong({ mood }).catch((err) => {
      setError(err.message || `Could not load a song for ${mood}.`);
    });
  }

  useEffect(() => {
    let cancelled = false;
    const videoElement = videoRef.current;

    async function initialize() {
      try {
        await init({
          landmarkerRef,
          videoRef,
          streamRef,
          setExpression,
        });

        if (!cancelled) {
          setCameraReady(true);
          setExpression("Camera ready. Click Detect Expression.");
        }
      } catch (err) {
        console.error("Initialization error:", err);

        if (!cancelled) {
          setError(
            err.name === "NotAllowedError"
              ? "Camera permission denied. Allow camera access in your browser."
              : err.name === "NotReadableError"
                ? "Camera is busy. Close other apps using the camera."
                : err.message || "Failed to initialize face detection.",
          );
          setExpression("Camera unavailable");
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
      detectingRef.current = false;

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
      }

      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, []);

  function handleDetect() {
    if (!cameraReady) {
      setError("Camera is not ready.");
      return;
    }

    if (detectingRef.current) {
      detectingRef.current = false;
      setIsDetecting(false);

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      setExpression("Detection stopped.");
      return;
    }

    detectingRef.current = true;
    setIsDetecting(true);
    setError("");

    detect({
      landmarkerRef,
      videoRef,
      setExpression,
      onExpressionDetected: handleExpressionDetected,
      animationRef,
      detectingRef,
    });
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h1>Face Expression Detector</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "100%",
          maxWidth: 800,
          minHeight: 200,
          background: "#222",
          borderRadius: 12,
        }}
      />

      <h2>{expression}</h2>

      {loading && <p role="status">Finding a song for this mood…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleDetect} disabled={!cameraReady}>
        {isDetecting ? "Stop Detection" : "Detect Expression"}
      </button>
    </div>
  );
}
