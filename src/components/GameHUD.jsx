// GameHUD.jsx - Cyberpunk In-Game Heads-Up Display & Telemetry

import React from 'react';
import { Pause, Play, RotateCcw, Home, Shield, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import { PORTAL_DIRECTIVE } from '../game/PortalSystem.js';
import { GESTURE_STATE } from '../game/GestureRecognizer.js';

export function GameHUD({
  hudData,
  isPaused,
  onPause,
  onResume,
  onRestart,
  onExitToMenu
}) {
  const {
    score = 0,
    combo = 0,
    multiplier = 1,
    wave = 1,
    portalStability = 100,
    directive = PORTAL_DIRECTIVE.SLICE_CYAN,
    activeSeal = null,
    shieldActive = false,
    shieldEnergy = 100,
    shieldDepleted = false,
    gestureState = GESTURE_STATE.NONE
  } = hudData || {};

  // Stability Color
  let stabilityColor = 'from-cyan-500 to-blue-500';
  let stabilityText = 'text-cyan-400';
  if (portalStability < 30) {
    stabilityColor = 'from-red-600 to-rose-500';
    stabilityText = 'text-red-400 animate-pulse';
  } else if (portalStability < 60) {
    stabilityColor = 'from-amber-500 to-orange-500';
    stabilityText = 'text-amber-400';
  }

  // Directive Styling
  const getDirectiveBadge = () => {
    if (activeSeal) {
      return {
        bg: 'bg-amber-950/80 border-amber-500 text-amber-300',
        icon: <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />,
        title: 'EMERGENCY: SEAL BREACH',
        desc: `GAMBAR POLA ${activeSeal.name} DENGAN TELUNJUK!`
      };
    }
    if (directive === PORTAL_DIRECTIVE.SLICE_CYAN) {
      return {
        bg: 'bg-cyan-950/80 border-cyan-500 text-cyan-300',
        icon: <Zap className="w-5 h-5 text-cyan-400" />,
        title: 'DIRECTIVE: PURGE CYAN',
        desc: 'Potong Orb Cyan! Hindari Orb Magenta & Glitch Trap.'
      };
    }
    if (directive === PORTAL_DIRECTIVE.SLICE_MAGENTA) {
      return {
        bg: 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-300',
        icon: <Zap className="w-5 h-5 text-fuchsia-400" />,
        title: 'DIRECTIVE: PURGE MAGENTA',
        desc: 'Potong Orb Magenta! Hindari Orb Cyan & Glitch Trap.'
      };
    }
    return {
      bg: 'bg-emerald-950/80 border-emerald-500 text-emerald-300',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      title: 'DIRECTIVE: DEFEND',
      desc: 'Buka Telapak Tangan untuk Menahan Gelombang!'
    };
  };

  const directiveBadge = getDirectiveBadge();

  // Gesture Label
  const getGestureIndicator = () => {
    switch (gestureState) {
      case GESTURE_STATE.POINTING:
        return {
          label: 'ENERGY SLASH (TELUNJUK)',
          color: 'text-cyan-400 border-cyan-500/50 bg-cyan-950/40',
          icon: <Zap className="w-4 h-4 text-cyan-400" />
        };
      case GESTURE_STATE.OPEN_PALM:
        return {
          label: shieldDepleted ? 'SHIELD OVERHEAT!' : 'SHIELD AKTIF (TELAPAK)',
          color: shieldDepleted ? 'text-red-400 border-red-500/50 bg-red-950/40' : 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40',
          icon: <Shield className="w-4 h-4" />
        };
      default:
        return {
          label: 'STANDBY (SIAPKAN TANGAN)',
          color: 'text-slate-400 border-slate-700/50 bg-slate-900/40',
          icon: <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        };
    }
  };

  const gestureInd = getGestureIndicator();

  return (
    <div className="absolute inset-0 pointer-events-none z-10 p-4 sm:p-6 flex flex-col justify-between">
      {/* Top Header: Stability Bar, Directive, Score & Wave */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start gap-4">
          {/* Portal Stability Health Gauge */}
          <div className="w-56 sm:w-72 cyber-panel p-2.5 sm:p-3 pointer-events-auto">
            <div className="flex justify-between items-center text-xs font-mono mb-1">
              <span className="text-slate-400">RIFT STABILITY</span>
              <span className={`font-bold ${stabilityText}`}>{Math.round(portalStability)}%</span>
            </div>
            <div className="w-full h-3 bg-black/60 rounded overflow-hidden border border-slate-700/60 p-0.5">
              <div
                className={`h-full rounded transition-all duration-200 bg-gradient-to-r ${stabilityColor}`}
                style={{ width: `${Math.max(0, Math.min(100, portalStability))}%` }}
              ></div>
            </div>
          </div>

          {/* Central Directive Banner */}
          <div className="hidden md:flex flex-col items-center max-w-md">
            <div className={`flex items-center gap-2.5 px-5 py-2 border rounded shadow-lg backdrop-blur-md ${directiveBadge.bg}`}>
              {directiveBadge.icon}
              <div className="flex flex-col text-left">
                <span className="font-cyber font-bold text-xs tracking-wider uppercase">
                  {directiveBadge.title}
                </span>
                <span className="text-[11px] font-sub text-slate-200">
                  {directiveBadge.desc}
                </span>
              </div>
            </div>
          </div>

          {/* Score & Multiplier */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="cyber-panel px-4 py-2 sm:py-2.5 text-right">
              <div className="text-[10px] font-mono text-cyan-400 tracking-wider">SCORE</div>
              <div className="text-xl sm:text-2xl font-bold font-cyber text-white glow-cyan">
                {score.toLocaleString()}
              </div>
            </div>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="cyber-panel p-3 text-cyan-400 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <Pause className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Directive (Shown only on small screens) */}
        <div className="flex md:hidden w-full justify-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 border rounded text-xs ${directiveBadge.bg}`}>
            {directiveBadge.icon}
            <span className="font-cyber font-bold">{directiveBadge.title}</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Combo, Shield Gauge & Gesture State */}
      <div className="flex justify-between items-end gap-4">
        {/* Left: Combo Counter & Multiplier */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          {combo > 1 && (
            <div className="cyber-panel px-4 py-2 flex items-baseline gap-2 border-magenta-500/50">
              <span className="text-2xl sm:text-3xl font-black font-cyber text-magenta-400 glow-magenta">
                {combo}
              </span>
              <span className="text-xs font-mono uppercase text-magenta-300">COMBO!</span>
              {multiplier > 1 && (
                <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold font-cyber bg-magenta-500 text-black">
                  {multiplier}x {multiplier >= 8 ? 'OVERDRIVE!' : ''}
                </span>
              )}
            </div>
          )}

          {/* Wave info */}
          <div className="text-xs font-mono text-slate-400 px-1">
            DIMENSIONAL WAVE // 0{wave}
          </div>
        </div>

        {/* Right: Shield Energy Meter & Gesture State Indicator */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Active Gesture Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono ${gestureInd.color}`}>
            {gestureInd.icon}
            <span>{gestureInd.label}</span>
          </div>

          {/* Shield Energy Gauge */}
          <div className="cyber-panel p-2 w-48 sm:w-56 text-right">
            <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 mb-1">
              <span>ENERGY SHIELD</span>
              <span className={shieldDepleted ? 'text-red-400 animate-pulse' : ''}>
                {shieldDepleted ? 'OVERHEAT' : `${Math.round(shieldEnergy)}%`}
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded overflow-hidden border border-emerald-900/60">
              <div
                className={`h-full transition-all duration-100 ${shieldDepleted ? 'bg-red-500' : 'bg-emerald-400'}`}
                style={{ width: `${shieldEnergy}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pause Modal Overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md pointer-events-auto">
          <div className="cyber-panel p-8 max-w-sm w-full mx-4 text-center border-cyan-500 flex flex-col gap-5">
            <h2 className="text-2xl font-bold font-cyber text-cyan-400 glow-cyan uppercase">
              // GAME PAUSED //
            </h2>
            <p className="text-sm text-slate-300 font-sub">
              Sistem dimensional ditangguhkan.
            </p>

            <div className="flex flex-col gap-3">
              <button onClick={onResume} className="cyber-btn w-full">
                <Play className="w-4 h-4 fill-current" />
                RESUME MISSION
              </button>
              <button onClick={onRestart} className="cyber-btn cyber-btn-magenta w-full">
                <RotateCcw className="w-4 h-4" />
                RESTART MISSION
              </button>
              <button onClick={onExitToMenu} className="cyber-btn cyber-btn-ghost w-full">
                <Home className="w-4 h-4" />
                EXIT TO MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

