// FruitHUD.jsx - Fruit Ninja Dojo HUD with Single & Multiplayer Dual-Duel UI

import React, { useState } from 'react';
import { Pause, Play, RotateCcw, Home, Camera, Clock, Gauge, Swords, Users } from 'lucide-react';
import { GAME_MODE } from '../game/GameEngine.js';

export function FruitHUD({
  hudData,
  isPaused,
  cameraOpacity = 0.65,
  fruitSpeed = 1.0,
  onSetCameraOpacity,
  onSetFruitSpeed,
  onPause,
  onResume,
  onRestart,
  onExitToMenu
}) {
  const {
    score = 0,
    strikes = 0,
    maxStrikes = 3,
    mode = GAME_MODE.CLASSIC,
    arcadeTimer = 60,
    fruitsSliced = 0,
    p1Score = 0,
    p2Score = 0,
    p1Fruits = 0,
    p2Fruits = 0
  } = hudData || {};

  const [showOpacitySlider, setShowOpacitySlider] = useState(false);

  const isMultiplayer = mode === GAME_MODE.VERSUS || mode === GAME_MODE.COOP;

  const cycleOpacity = () => {
    if (cameraOpacity >= 0.9) {
      onSetCameraOpacity(0);
    } else if (cameraOpacity === 0) {
      onSetCameraOpacity(0.4);
    } else if (cameraOpacity <= 0.45) {
      onSetCameraOpacity(0.65);
    } else {
      onSetCameraOpacity(1.0);
    }
  };

  const cycleFruitSpeed = () => {
    if (fruitSpeed <= 0.8) {
      onSetFruitSpeed(1.0);
    } else if (fruitSpeed < 1.2) {
      onSetFruitSpeed(1.25);
    } else {
      onSetFruitSpeed(0.75);
    }
  };

  const getOpacityLabel = () => {
    if (cameraOpacity === 0) return 'KAMERA: OFF';
    if (cameraOpacity >= 0.95) return 'KAMERA: 100%';
    return `KAMERA: ${Math.round(cameraOpacity * 100)}%`;
  };

  const getSpeedLabel = () => {
    if (fruitSpeed <= 0.8) return '🐢 SANTAI (0.75x)';
    if (fruitSpeed >= 1.2) return '⚡ CEPAT (1.25x)';
    return '⚖️ NORMAL (1.0x)';
  };

  // Calculate Versus Tug-of-War percentage (balanced 50% at match start)
  const totalVersus = p1Score + p2Score;
  const p1Ratio = totalVersus === 0 ? 50 : Math.round((p1Score / totalVersus) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-3 sm:p-6 flex flex-col justify-between select-none">
      {/* Top Header */}
      {isMultiplayer ? (
        /* MULTIPLAYER HEADER (VERSUS / CO-OP) */
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-3">
            {/* P1 Score (Left) */}
            <div className="flex items-center gap-3 pointer-events-auto bg-black/75 px-4 py-2 rounded-2xl border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
              <div>
                <div className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                  PLAYER 1 (PEDANG BIRU)
                </div>
                <div className="text-3xl sm:text-4xl font-black font-cyber text-white">
                  {p1Score.toLocaleString()}
                </div>
                <div className="text-[10px] text-cyan-200/80 font-mono">
                  BUAH: {p1Fruits}
                </div>
              </div>
            </div>

            {/* Center: Timer & Mode Badge */}
            <div className="flex flex-col items-center pointer-events-auto">
              <div className="flex items-center gap-2 bg-black/80 px-4 py-1.5 rounded-full border border-amber-500/60 text-amber-400 font-cyber font-black text-lg shadow-lg">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{arcadeTimer}s</span>
              </div>
              <div className="text-[11px] font-mono text-amber-300 font-bold tracking-wider mt-1 uppercase flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                <span>{mode === GAME_MODE.VERSUS ? 'DUEL 2 PEMAIN' : 'CO-OP 2 PEMAIN'}</span>
              </div>
            </div>

            {/* P2 Score (Right) */}
            <div className="flex items-center gap-3 pointer-events-auto bg-black/75 px-4 py-2 rounded-2xl border-2 border-rose-500 shadow-[0_0_20px_rgba(255,0,85,0.3)] text-right">
              <div>
                <div className="text-[10px] font-mono font-bold text-rose-300 uppercase tracking-widest">
                  PLAYER 2 (PEDANG MERAH)
                </div>
                <div className="text-3xl sm:text-4xl font-black font-cyber text-white">
                  {p2Score.toLocaleString()}
                </div>
                <div className="text-[10px] text-rose-200/80 font-mono">
                  BUAH: {p2Fruits}
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
            </div>
          </div>

          {/* Versus Tug-of-War Bar (Only in Versus Mode) */}
          {mode === GAME_MODE.VERSUS && (
            <div className="w-full max-w-xl mx-auto pointer-events-auto bg-black/60 p-1.5 rounded-full border border-stone-700 flex flex-col gap-1">
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-stone-900">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.max(5, Math.min(95, p1Ratio))}%` }}
                ></div>
                <div
                  className="h-full bg-rose-500 transition-all duration-300 flex-1"
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono px-2 font-bold">
                <span className="text-cyan-300">P1: {p1Ratio}%</span>
                <span className="text-amber-300">DOMINASI DUEL</span>
                <span className="text-rose-400">P2: {100 - p1Ratio}%</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* SINGLE PLAYER HEADER */
        <div className="flex justify-between items-start gap-4">
          {/* Left: Score Box */}
          <div className="flex flex-col gap-1 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-4xl sm:text-6xl font-black font-cyber text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                {score.toLocaleString()}
              </span>
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-200/90 drop-shadow">
              BUAH TERPOTONG: {fruitsSliced}
            </div>
          </div>

          {/* Center: Strikes (Classic) or Timer (Arcade) */}
          <div className="pointer-events-auto flex flex-col items-center">
            {mode === GAME_MODE.CLASSIC ? (
              <div className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-full border border-amber-600/50 backdrop-blur shadow-lg">
                <span className="text-xs font-bold text-slate-300 mr-1">NYAWA:</span>
                {[...Array(maxStrikes)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl sm:text-2xl transition-transform ${
                      i < strikes ? 'text-red-500 scale-125 drop-shadow-[0_0_10px_rgba(255,0,0,0.9)]' : 'text-slate-600'
                    }`}
                  >
                    {i < strikes ? '❌' : '⭕'}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/70 px-5 py-2 rounded-full border border-amber-500/60 backdrop-blur text-amber-400 font-cyber font-bold text-lg sm:text-xl shadow-lg">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>{arcadeTimer}s</span>
              </div>
            )}
          </div>

          {/* Right: Fruit Speed Toggle, Camera Opacity & Pause */}
          <div className="flex items-center gap-2.5 pointer-events-auto relative">
            {/* Quick Speed Button */}
            <button
              onClick={cycleFruitSpeed}
              className="px-3 py-2 rounded-xl text-xs font-bold font-cyber flex items-center gap-1.5 border border-amber-600/50 bg-black/70 text-amber-300 backdrop-blur shadow-lg hover:bg-black/90 cursor-pointer"
              title="Klik untuk ubah kecepatan buah (Santai / Normal / Cepat)"
            >
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>{getSpeedLabel()}</span>
            </button>

            {/* Camera Opacity Toggle & Hover Slider */}
            <div className="relative">
              <button
                onClick={cycleOpacity}
                onMouseEnter={() => setShowOpacitySlider(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold font-cyber flex items-center gap-1.5 border backdrop-blur shadow-lg transition-all cursor-pointer ${
                  cameraOpacity > 0
                    ? 'bg-amber-600/80 border-amber-400 text-white shadow-[0_0_18px_rgba(245,158,11,0.4)]'
                    : 'bg-black/70 border-stone-700 text-slate-300 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">{getOpacityLabel()}</span>
              </button>

              {showOpacitySlider && (
                <div
                  onMouseLeave={() => setShowOpacitySlider(false)}
                  className="absolute top-12 right-0 p-3 bg-stone-950/95 border border-amber-500/50 rounded-xl shadow-2xl flex flex-col gap-2 w-52 z-30 backdrop-blur"
                >
                  <div className="flex justify-between text-[11px] font-mono text-amber-300">
                    <span>TRANSPARANSI KAMERA</span>
                    <span className="font-bold">{Math.round(cameraOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={cameraOpacity}
                    onChange={(e) => onSetCameraOpacity(parseFloat(e.target.value))}
                    className="accent-amber-400 cursor-pointer w-full"
                  />
                </div>
              )}
            </div>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="p-2.5 bg-black/70 hover:bg-black/90 text-amber-300 rounded-xl border border-amber-600/50 transition-colors shadow-lg cursor-pointer"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Control Row in Multiplayer */}
      {isMultiplayer && (
        <div className="flex justify-between items-end pointer-events-auto">
          <div className="text-xs font-mono text-cyan-300 bg-black/60 px-3 py-1.5 rounded-lg border border-cyan-500/40">
            ✋ P1: Tangan Kiri (Layar Kiri)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cycleFruitSpeed}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-black/70 border border-amber-500/40 text-amber-300"
            >
              <Gauge className="w-3.5 h-3.5 inline mr-1" />
              {getSpeedLabel()}
            </button>
            <button
              onClick={cycleOpacity}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-black/70 border border-amber-500/40 text-amber-300"
            >
              <Camera className="w-3.5 h-3.5 inline mr-1" />
              {getOpacityLabel()}
            </button>
            <button
              onClick={onPause}
              className="p-2 bg-black/70 text-amber-300 rounded-lg border border-amber-600/50"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-mono text-rose-300 bg-black/60 px-3 py-1.5 rounded-lg border border-rose-500/40">
            ✋ P2: Tangan Kanan / Mouse
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-auto">
          <div className="cyber-panel p-8 max-w-sm w-full mx-4 text-center border-amber-500/60 flex flex-col gap-5 bg-stone-950/90 rounded-2xl">
            <h2 className="text-2xl font-black font-cyber text-amber-400 uppercase tracking-widest drop-shadow">
              // GAME DIJEDA //
            </h2>
            <div className="flex flex-col gap-3">
              <button onClick={onResume} className="cyber-btn cyber-btn-amber w-full py-3">
                <Play className="w-4 h-4 fill-current" />
                LANJUTKAN
              </button>
              <button onClick={onRestart} className="cyber-btn w-full py-3">
                <RotateCcw className="w-4 h-4" />
                ULANGI GAME
              </button>
              <button onClick={onExitToMenu} className="cyber-btn cyber-btn-ghost w-full py-3">
                <Home className="w-4 h-4" />
                MENU UTAMA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
