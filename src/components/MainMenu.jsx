// MainMenu.jsx - Fruit Slice Ninja Motion Edition Main Screen

import React from 'react';
import { Play, Trophy, HelpCircle, Sliders, Sparkles, Camera, Loader2, AlertTriangle, Swords, Zap, Users } from 'lucide-react';
import { getHighScore } from '../utils/storage.js';
import { TRACKING_STATUS } from '../hooks/useHandTracking.js';
import { GAME_MODE } from '../game/GameEngine.js';

export function MainMenu({
  trackingStatus,
  onStartGame,
  onOpenCalibration,
  onOpenTutorial,
  onOpenSettings,
  onRetryCamera
}) {
  const highScore = getHighScore();

  const getStatusBadge = () => {
    switch (trackingStatus) {
      case TRACKING_STATUS.READY:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI SENSOR: READY (KAMERA AKTIF)</span>
          </div>
        );
      case TRACKING_STATUS.LOADING_MODEL:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>MEMUAT MODEL AI MEDIAPIPE...</span>
          </div>
        );
      case TRACKING_STATUS.REQUESTING_CAMERA:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs font-mono">
            <Camera className="w-3.5 h-3.5 animate-pulse" />
            <span>MEMINTA IZIN WEBCAM...</span>
          </div>
        );
      case TRACKING_STATUS.PERMISSION_DENIED:
        return (
          <button
            onClick={onRetryCamera}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/90 border border-rose-500 text-rose-300 text-xs font-mono hover:bg-rose-900 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>IZIN KAMERA DITOLAK (KLIK COBA LAGI)</span>
          </button>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>STANDBY</span>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 sm:p-10 text-center select-none bg-gradient-to-b from-stone-950/80 via-transparent to-stone-950/95 overflow-y-auto">
      {/* Top Bar with Live Sensor Badge & High Score */}
      <div className="w-full flex justify-between items-center max-w-5xl">
        {getStatusBadge()}

        <div className="flex items-center gap-2 px-5 py-2 rounded-xl bg-black/60 border border-amber-500/50 text-amber-400 font-mono shadow-lg backdrop-blur">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase tracking-wider text-amber-200">BEST SCORE:</span>
          <span className="font-black text-lg sm:text-xl text-amber-300">{highScore.toLocaleString()}</span>
        </div>
      </div>

      {/* Hero Title: Fruit Slice Ninja */}
      <div className="flex flex-col items-center my-auto py-4">
        <div className="text-xs sm:text-sm tracking-[0.35em] font-mono text-amber-400 uppercase mb-2 drop-shadow">
          // MOTION WEBCAM MULTIPLAYER //
        </div>

        <div className="relative">
          <h1 className="text-5xl sm:text-8xl md:text-9xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-red-600 font-cyber drop-shadow-[0_8px_25px_rgba(255,140,0,0.6)]">
            FRUIT NINJA
          </h1>
          <div className="absolute -top-3 -right-8 text-2xl sm:text-4xl font-black text-amber-400 font-mono">
            果切
          </div>
        </div>

        <h2 className="text-base sm:text-2xl font-bold tracking-[0.2em] text-red-400 font-cyber -mt-1 sm:-mt-3 uppercase drop-shadow">
          MOTION & MULTIPLAYER EDITION
        </h2>

        <p className="max-w-xl text-amber-100/90 text-xs sm:text-base mt-3 px-4 font-sub leading-relaxed drop-shadow">
          Ayunkan tangan di depan webcam untuk memotong buah segar. Mainkan sendiri atau <strong>duel 2 pemain</strong> di satu kamera bersama teman!
        </p>

        {/* Game Mode Selection Grid */}
        <div className="flex flex-col gap-3 mt-6 w-full max-w-lg">
          {/* Row 1: Single Player Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onStartGame(GAME_MODE.CLASSIC)}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-cyber font-black text-sm sm:text-base shadow-[0_6px_20px_rgba(230,0,38,0.4)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300"
            >
              <Swords className="w-5 h-5 fill-current" />
              <span>CLASSIC (1P 3 NYAWA)</span>
            </button>

            <button
              onClick={() => onStartGame(GAME_MODE.ARCADE)}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-cyber font-black text-sm sm:text-base shadow-[0_6px_20px_rgba(255,193,7,0.4)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-stone-900"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>ARCADE (1P 60s BLITZ)</span>
            </button>
          </div>

          {/* Row 2: 2-Player Multiplayer Modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onStartGame(GAME_MODE.VERSUS)}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-rose-600 hover:from-cyan-500 hover:to-rose-500 text-white font-cyber font-black text-sm sm:text-base shadow-[0_6px_25px_rgba(0,240,255,0.4)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-cyan-300"
            >
              <Users className="w-5 h-5" />
              <span>⚔️ 2P VERSUS DUEL</span>
            </button>

            <button
              onClick={() => onStartGame(GAME_MODE.COOP)}
              className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-cyber font-black text-sm sm:text-base shadow-[0_6px_20px_rgba(16,185,129,0.4)] transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-300"
            >
              <Users className="w-5 h-5" />
              <span>🤝 2P CO-OP RUSH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 w-full max-w-2xl pt-2">
        <button
          onClick={onOpenTutorial}
          className="cyber-btn cyber-btn-ghost text-xs sm:text-sm py-2 px-4 rounded-xl border-amber-500/40 text-amber-200"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          CARA BERMAIN & MULTIPLAYER
        </button>

        <button
          onClick={onOpenCalibration}
          className="cyber-btn cyber-btn-ghost text-xs sm:text-sm py-2 px-4 rounded-xl border-amber-500/40 text-amber-200"
        >
          <Sliders className="w-4 h-4 text-orange-400" />
          KALIBRASI WEBCAM
        </button>

        <button
          onClick={onOpenSettings}
          className="cyber-btn cyber-btn-ghost text-xs sm:text-sm py-2 px-4 rounded-xl border-amber-500/40 text-amber-200"
        >
          <Sliders className="w-4 h-4 text-slate-300" />
          PENGATURAN
        </button>
      </div>
    </div>
  );
}
