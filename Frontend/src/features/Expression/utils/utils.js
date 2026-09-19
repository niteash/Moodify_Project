import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export const init = async ({ landmarkerRef, videoRef, streamRef }) => {
  try {
    // Load MediaPipe Vision
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    // Create Face Landmarker
    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1,
    });

    console.log("Face Landmarker loaded");

    // Request camera
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });

    console.log("Camera permission granted");

    // Connect camera to video
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      await videoRef.current.play();
    }
  } catch (error) {
    console.error("Face Expression Error:", error);

    if (error.name === "NotReadableError") {
      setExpression("Camera is already in use");
    } else if (error.name === "NotAllowedError") {
      setExpression("Camera permission denied");
    } else if (error.name === "NotFoundError") {
      setExpression("No camera found");
    } else {
      setExpression("Camera initialization failed");
    }
  }
};

export const detect = ({ landmarkerRef, videoRef, setExpression }) => {
  if (!landmarkerRef.current || !videoRef.current) {
    return;
  }

  const video = videoRef.current;

  // Wait until video has actual frames
  if (video.readyState < 2) {
    animationRef.current = requestAnimationFrame(detect);
    return;
  }

  const results = landmarkerRef.current.detectForVideo(
    video,
    performance.now(),
  );

  if (results.faceBlendshapes?.length > 0) {
    const blendshapes = results.faceBlendshapes[0].categories;

    const getScore = (name) =>
      blendshapes.find((b) => b.categoryName === name)?.score || 0;

    const smileLeft = getScore("mouthSmileLeft");
    const smileRight = getScore("mouthSmileRight");

    const jawOpen = getScore("jawOpen");
    const browUp = getScore("browInnerUp");

    const frownLeft = getScore("mouthFrownLeft");
    const frownRight = getScore("mouthFrownRight");

    let currentExpression = "Neutral";
    if (smileLeft > 0.3 && smileRight > 0.2) {
      currentExpression = "Happy 😄";
    } else if (jawOpen > 0.4 && browUp > 0.3) {
      currentExpression = "Surprised 😲";
    } else if (
      frownLeft > 0.15 &&
      frownRight > 0.15 &&
      smileLeft < 0.15 &&
      smileRight < 0.15
    ) {
      currentExpression = "Sad 😢";
    }
    setExpression(currentExpression);
  }

  animationRef.current = requestAnimationFrame(detect);
};
