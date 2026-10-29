// App.jsx - Fruit Slice Ninja Motion Edition Main Orchestrator

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, GAME_STATE, GAME_MODE } from './game/GameEngine.js';
import { useHandTracking, TRACKING_STATUS } from './hooks/useHandTracking.js';
import { MainMenu } from './components/MainMenu.jsx';
import { FruitHUD } from './components/FruitHUD.jsx';
import { GameOver } from './components/GameOver.jsx';
import { CameraCalibration } from './components/CameraCalibration.jsx';
import { TutorialModal } from './components/TutorialModal.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { getSettings } from './utils/storage.js';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function App() {
  const canvasRef = useRef(null);
  const pipCanvasRef = useRef(null);
  const engineRef = useRef(null);
  const hiddenVideoRef = useRef(null);

  // App & Game UI state
  const [gameState, setGameState] = useState(GAME_STATE.MENU);
  const [hudData, setHudData] = useState({});
  const [gameOverStats, setGameOverStats] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  // Translucent Camera & Background blending: 0 = Pure Dojo Wood, 0.65 = Balanced Translucent, 1 = Full Camera
  const [cameraOpacity, setCameraOpacity] = useState(0.65);
  // Fruit Speed (0.75 = Santai, 1.0 = Normal Floaty, 1.25 = Cepat)
  const [fruitSpeed, setFruitSpeed] = useState(() => getSettings().fruitSpeed || 1.0);

  // Modals
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPip, setShowPip] = useState(false);

  // Hand tracking hook connected to persistent DOM video element
  const handTracking = useHandTracking(hiddenVideoRef);
  const {
    status: trackingStatus,
    errorMessage: trackingError,
    videoRef,
    latestLandmarksRef,
    allLandmarksRef,
    startTracking
  } = handTracking;

  // Auto-initiate camera stream on load so tracking is instant when starting
  useEffect(() => {
    startTracking();
  }, [startTracking]);

  // Initialize game engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const engine = new GameEngine(canvas, (data) => {
      if (data.type === 'GAMEOVER') {
        setGameOverStats(data.stats);
        setGameState(GAME_STATE.GAMEOVER);
      } else if (data.type === 'TICK') {
        setHudData(data);
      }
    });

    engine.setCameraOpacity(cameraOpacity);

    engine.updateSettings = (settings) => {
      if (!settings) return;
      engine.coordinateMapper.updateConfig({
        mirror: settings.mirrorMode,
        sensitivity: settings.sensitivity,
        smoothingFactor: settings.smoothing
      });
      engine.particles.maxParticles = settings.particleDensity === 'low' ? 150 : 350;
      if (settings.fruitSpeed !== undefined) {
        engine.setFruitSpeed(settings.fruitSpeed);
      }
    };
    engine.updateSettings(getSettings());
    engineRef.current = engine;

    // Window resize handler
    const handleResize = () => {
      if (canvas && engineRef.current) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyDown = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (engineRef.current) {
          if (engineRef.current.state === GAME_STATE.PLAYING) {
            engineRef.current.pauseGame();
            setIsPaused(true);
          } else if (engineRef.current.state === GAME_STATE.PAUSED) {
            engineRef.current.resumeGame();
            setIsPaused(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 60 FPS Game Loop
    let lastTime = performance.now();
    let animId;

    const gameLoop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const videoEl = videoRef.current;
      if (engineRef.current) {
        const hands = (allLandmarksRef.current && allLandmarksRef.current.length > 0)
          ? allLandmarksRef.current
          : latestLandmarksRef.current;
        engineRef.current.update(dt, hands, videoEl);
        engineRef.current.render(videoEl);
      }

      // Render PIP webcam preview (if enabled and cameraOpacity is 0)
      if (showPip && pipCanvasRef.current && videoEl && videoEl.readyState >= 2) {
        const pipCanvas = pipCanvasRef.current;
        const pipCtx = pipCanvas.getContext('2d');
        const pw = pipCanvas.width;
        const ph = pipCanvas.height;

        pipCtx.save();
        pipCtx.translate(pw, 0);
        pipCtx.scale(-1, 1);
        pipCtx.drawImage(videoEl, 0, 0, pw, ph);
        pipCtx.restore();

        // Render pointer landmark dot on PIP
        const lm = latestLandmarksRef.current;
        if (lm && lm.length >= 21) {
          const pt = lm[8]; // Index tip
          pipCtx.beginPath();
          pipCtx.arc((1 - pt.x) * pw, pt.y * ph, 6, 0, Math.PI * 2);
          pipCtx.fillStyle = '#00f0ff';
          pipCtx.shadowColor = '#00f0ff';
          pipCtx.shadowBlur = 10;
          pipCtx.fill();
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [latestLandmarksRef, videoRef, showPip, cameraOpacity]);

  // Actions
  const handleStartGame = async (mode = GAME_MODE.CLASSIC) => {
    await startTracking();
    if (engineRef.current) {
      engineRef.current.startNewGame(mode);
      setGameState(GAME_STATE.PLAYING);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
      setIsPaused(false);
    }
  };

  const handleRestart = async () => {
    setIsPaused(false);
    setGameOverStats(null);
    await startTracking();
    if (engineRef.current) {
      engineRef.current.startNewGame(engineRef.current.mode);
      setGameState(GAME_STATE.PLAYING);
    }
  };

  const handleExitToMenu = () => {
    setIsPaused(false);
    setGameOverStats(null);
    if (engineRef.current) {
      engineRef.current.state = GAME_STATE.MENU;
      setGameState(GAME_STATE.MENU);
    }
  };

  const handleSetCameraOpacity = (val) => {
    setCameraOpacity(val);
    if (engineRef.current) {
      engineRef.current.setCameraOpacity(val);
    }
  };

  const handleSetFruitSpeed = (speed) => {
    setFruitSpeed(speed);
    if (engineRef.current) {
      engineRef.current.setFruitSpeed(speed);
    }
  };

  const handleSettingsChanged = (newSettings) => {
    if (newSettings.fruitSpeed !== undefined) {
      setFruitSpeed(newSettings.fruitSpeed);
    }
    if (engineRef.current && engineRef.current.updateSettings) {
      engineRef.current.updateSettings(newSettings);
    }
  };

  const handleOpenCalibration = async () => {
    await startTracking();
    setIsCalibrationOpen(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sub">
      {/* Persistent Hidden Video Stream for Camera & AI Processing */}
      <video
        ref={hiddenVideoRef}
        playsInline
        autoPlay
        muted
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 640,
          height: 480,
          opacity: 0,
          pointerEvents: 'none'
        }}
      />

      {/* Main Gameplay Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair z-0"
      />

      {/* Camera Error Notification Banner */}
      {trackingError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 bg-rose-950/90 border border-rose-500 rounded-xl text-rose-200 text-xs font-mono shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{trackingError}</span>
          <button
            onClick={() => startTracking()}
            className="ml-2 px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold"
          >
            COBA LAGI
          </button>
        </div>
      )}

      {/* Main Menu UI */}
      {gameState === GAME_STATE.MENU && (
        <MainMenu
          trackingStatus={trackingStatus}
          onStartGame={handleStartGame}
          onOpenCalibration={handleOpenCalibration}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onRetryCamera={startTracking}
        />
      )}

      {/* In-Game Fruit HUD */}
      {gameState === GAME_STATE.PLAYING && (
        <FruitHUD
          hudData={hudData}
          isPaused={isPaused}
          cameraOpacity={cameraOpacity}
          fruitSpeed={fruitSpeed}
          onSetCameraOpacity={handleSetCameraOpacity}
          onSetFruitSpeed={handleSetFruitSpeed}
          onPause={handlePause}
          onResume={handleResume}
          onRestart={handleRestart}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {/* Game Over Screen */}
      {gameState === GAME_STATE.GAMEOVER && (
        <GameOver
          stats={gameOverStats}
          onRestart={handleRestart}
          onExitToMenu={handleExitToMenu}
        />
      )}

      {/* Calibration Modal */}
      <CameraCalibration
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        trackingState={handTracking}
        onSettingsChanged={handleSettingsChanged}
      />

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={handleSettingsChanged}
      />
    </div>
  );
}
