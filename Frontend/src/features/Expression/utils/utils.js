import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const init = async ({
  landmarkerRef,
  videoRef,
  streamRef,
  setExpression,
}) => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera access is unavailable. Use localhost or HTTPS.");
    }

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });

    streamRef.current = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    if (!videoRef.current) {
      throw new Error("Video element is unavailable.");
    }

    videoRef.current.srcObject = streamRef.current;
    await videoRef.current.play();

    setExpression?.("Camera ready. Click Detect Expression.");
    console.log("Face Landmarker and camera initialized successfully.");
  } catch (error) {
    console.error("Face Expression Error:", error);

    if (landmarkerRef.current) {
      landmarkerRef.current.close();
      landmarkerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const messages = {
      NotAllowedError:
        "Camera permission denied. Allow camera access in browser settings.",
      NotFoundError: "No camera found on this device.",
      NotReadableError: "Camera is already in use by another application.",
      OverconstrainedError:
        "The camera does not support the requested settings.",
      SecurityError: "Camera access is blocked by browser security settings.",
    };

    setExpression?.(
      messages[error.name] || error.message || "Camera initialization failed.",
    );

    throw error;
  }
};

export const detect = ({
  landmarkerRef,
  videoRef,
  setExpression,
  onExpressionDetected,
  animationRef,
}) => {
  if (!landmarkerRef.current || !videoRef.current) {
    setExpression?.("Camera or face detector is not ready.");
    return;
  }

  const video = videoRef.current;

  if (video.readyState < 2 || video.videoWidth === 0) {
    setExpression?.("Waiting for camera frames...");

    animationRef.current = requestAnimationFrame(() =>
      detect({
        landmarkerRef,
        videoRef,
        setExpression,
        onExpressionDetected,
        animationRef,
      }),
    );

    return;
  }

  try {
    const results = landmarkerRef.current.detectForVideo(
      video,
      performance.now(),
    );

    if (results.faceBlendshapes?.length > 0) {
      const blendshapes = results.faceBlendshapes[0].categories;

      const getScore = (name) =>
        blendshapes.find((item) => item.categoryName === name)?.score ?? 0;

      const smileLeft = getScore("mouthSmileLeft");
      const smileRight = getScore("mouthSmileRight");
      const jawOpen = getScore("jawOpen");
      const browUp = getScore("browInnerUp");
      const frownLeft = getScore("mouthFrownLeft");
      const frownRight = getScore("mouthFrownRight");
      const browDownLeft = getScore("browDownLeft");
      const browDownRight = getScore("browDownRight");

      let currentExpression = "Neutral";

      if (smileLeft > 0.3 && smileRight > 0.3) {
        currentExpression = "happy";
      } else if (jawOpen > 0.4 && browUp > 0.3) {
        currentExpression = "surprised";
      } else if (
        browDownLeft > 0.25 &&
        browDownRight > 0.25 &&
        frownLeft > 0.1 &&
        frownRight > 0.1
      ) {
        currentExpression = "angry";
      } else if (
        frownLeft > 0.15 &&
        frownRight > 0.15 &&
        smileLeft < 0.15 &&
        smileRight < 0.15
      ) {
        currentExpression = "sad";
      }

      setExpression?.(currentExpression);
      onExpressionDetected?.(currentExpression);
    } else {
      setExpression?.("No face detected");
      onExpressionDetected?.("No face detected");
    }
  } catch (error) {
    console.error("Expression detection error:", error);
    setExpression?.("Expression detection failed.");
    return;
  }

  animationRef.current = requestAnimationFrame(() =>
    detect({
      landmarkerRef,
      videoRef,
      setExpression,
      onExpressionDetected,
      animationRef,
    }),
  );
};
