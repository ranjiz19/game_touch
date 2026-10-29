// useHandTracking.js - Robust React Hook for MediaPipe Hand Landmarker Vision Tasks

import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export const TRACKING_STATUS = {
  IDLE: 'IDLE',
  LOADING_MODEL: 'LOADING_MODEL',
  REQUESTING_CAMERA: 'REQUESTING_CAMERA',
  READY: 'READY',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NO_CAMERA: 'NO_CAMERA',
  ERROR: 'ERROR'
};

export function useHandTracking(providedVideoRef) {
  const [status, setStatus] = useState(TRACKING_STATUS.LOADING_MODEL);
  const [errorMessage, setErrorMessage] = useState('');
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [detectedHandCount, setDetectedHandCount] = useState(0);

  // Use provided video element ref or fallback internal ref
  const internalVideoRef = useRef(null);
  const videoRef = providedVideoRef || internalVideoRef;

  const landmarkerRef = useRef(null);
  const isModelLoadingRef = useRef(false);
  const isTrackingActiveRef = useRef(false);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const latestLandmarksRef = useRef(null);
  const allLandmarksRef = useRef([]);
  const lastVideoTimeRef = useRef(-1);

  // Initialize MediaPipe HandLandmarker singleton
  const initModel = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    if (isModelLoadingRef.current) return null;

    isModelLoadingRef.current = true;
    setStatus(TRACKING_STATUS.LOADING_MODEL);

    try {
      console.log('Loading MediaPipe FilesetResolver...');
      const resolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      try {
        console.log('Creating HandLandmarker with GPU delegate...');
        landmarkerRef.current = await HandLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 4,
          minHandDetectionConfidence: 0.35,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
        console.log('MediaPipe HandLandmarker GPU ready!');
      } catch (gpuErr) {
        console.warn('GPU initialization failed, falling back to CPU:', gpuErr);
        landmarkerRef.current = await HandLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU'
          },
          runningMode: 'VIDEO',
          numHands: 4,
          minHandDetectionConfidence: 0.35,
          minHandPresenceConfidence: 0.35,
          minTrackingConfidence: 0.35
        });
        console.log('MediaPipe HandLandmarker CPU ready!');
      }

      setStatus(TRACKING_STATUS.IDLE);
      return landmarkerRef.current;
    } catch (err) {
      console.error('Failed to load MediaPipe Hand Landmarker model:', err);
      setStatus(TRACKING_STATUS.ERROR);
      setErrorMessage('Gagal memuat AI Vision model. Mode Mouse aktif.');
      return null;
    } finally {
      isModelLoadingRef.current = false;
    }
  }, []);

  // Start webcam feed and continuous hand tracking
  const startTracking = useCallback(async () => {
    isTrackingActiveRef.current = true;
    setIsTrackingActive(true);

    // 1. Ensure Model is ready
    let landmarker = landmarkerRef.current;
    if (!landmarker) {
      landmarker = await initModel();
    }
    if (!landmarker) {
      console.warn('Cannot start tracking: HandLandmarker model not ready');
      return;
    }

    // 2. Request Camera Stream if not already running
    setStatus(TRACKING_STATUS.REQUESTING_CAMERA);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus(TRACKING_STATUS.NO_CAMERA);
        setErrorMessage('Browser tidak mendukung akses kamera.');
        return;
      }

      // Check if existing stream is already live
      const video = videoRef.current;
      let stream = streamRef.current;

      const isStreamLive = stream && stream.getVideoTracks().some(t => t.readyState === 'live');
      if (!isStreamLive) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            aspectRatio: { ideal: 1.7777777778 },
            facingMode: 'user'
          },
          audio: false
        });
        streamRef.current = stream;
      }

      if (video) {
        video.srcObject = stream;
        video.setAttribute('playsinline', '');
        video.setAttribute('autoplay', '');
        video.muted = true;

        await new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve();
          } else {
            video.onloadeddata = () => resolve();
            // Fallback timeout in case onloadeddata takes long
            setTimeout(resolve, 800);
          }
        });

        try {
          await video.play();
        } catch (playErr) {
          console.warn('video.play() warning:', playErr);
        }
      }

      setStatus(TRACKING_STATUS.READY);
      setErrorMessage('');

      // 3. Continuous Tracking Loop with synchronous ref check
      const detectLoop = () => {
        if (!isTrackingActiveRef.current) return;

        const currentVideo = videoRef.current;
        if (currentVideo && currentVideo.readyState >= 2 && landmarkerRef.current) {
          if (currentVideo.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = currentVideo.currentTime;
            try {
              const startTimeMs = performance.now();
              const results = landmarkerRef.current.detectForVideo(currentVideo, startTimeMs);

              if (results && results.landmarks && results.landmarks.length > 0) {
                latestLandmarksRef.current = results.landmarks[0];
                allLandmarksRef.current = results.landmarks;
                setDetectedHandCount(results.landmarks.length);
              } else {
                latestLandmarksRef.current = null;
                allLandmarksRef.current = [];
                setDetectedHandCount(0);
              }
            } catch (inferErr) {
              // Ignore occasional single-frame drop
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectLoop);
      };

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      console.error('Webcam access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setStatus(TRACKING_STATUS.PERMISSION_DENIED);
        setErrorMessage('Izin kamera ditolak. Izinkan webcam di address bar browser untuk bermain gestur.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setStatus(TRACKING_STATUS.NO_CAMERA);
        setErrorMessage('Webcam tidak ditemukan di perangkat. Kontrol Mouse diaktifkan.');
      } else {
        setStatus(TRACKING_STATUS.ERROR);
        setErrorMessage(`Error kamera: ${err.message || 'Tidak dapat memulai kamera'}`);
      }
    }
  }, [initModel, videoRef]);

  // Cleanly stop camera & release resources
  const stopTracking = useCallback(() => {
    isTrackingActiveRef.current = false;
    setIsTrackingActive(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    latestLandmarksRef.current = null;
    setDetectedHandCount(0);
    setStatus(TRACKING_STATUS.IDLE);
  }, [videoRef]);

  // Pre-load model immediately on mount
  useEffect(() => {
    initModel();

    return () => {
      stopTracking();
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {}
        landmarkerRef.current = null;
      }
    };
  }, [initModel, stopTracking]);

  return {
    status,
    errorMessage,
    isTrackingActive,
    detectedHandCount,
    videoRef,
    latestLandmarksRef,
    allLandmarksRef,
    startTracking,
    stopTracking
  };
}
