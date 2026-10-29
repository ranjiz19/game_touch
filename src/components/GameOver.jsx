// GameOver.jsx - Fruit Ninja Post-Match Debrief with Single & Multiplayer Winner Showcase

import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Zap, Swords, Crown, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GAME_MODE } from '../game/GameEngine.js';

export function GameOver({ stats, onRestart, onExitToMenu }) {
  const {
    mode = GAME_MODE.CLASSIC,
    score = 0,
    isNewHigh = false,
    fruitsSliced = 0,
    maxCombo = 0,
    reason = 'strikes',
    winner = null,
    p1Score = 0,
    p2Score = 0,
    p1Fruits = 0,
    p2Fruits = 0
  } = stats || {};

  const isVersus = mode === GAME_MODE.VERSUS;
  const isCoop = mode === GAME_MODE.COOP;

  useEffect(() => {
    if (isNewHigh || isVersus) {
      try {
        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#ff0055', '#ffd700', '#228b22']
        });
      } catch (e) {}
    }
  }, [isNewHigh, isVersus]);

  const getReasonTitle = () => {
    if (isVersus) {
      if (winner === 'P1') return '🏆 PLAYER 1 (PEDANG BIRU) MENANG!';
      if (winner === 'P2') return '🏆 PLAYER 2 (PEDANG MERAH) MENANG!';
      return '⚖️ HASIL SERI (DRAW)!';
    }
    if (isCoop) return '🤝 MISI CO-OP SELESAI!';
    if (reason === 'bomb') return '💥 BOM TERPOTONG! LEDAKAN!';
    if (reason === 'time') return '⏱️ WAKTU HABIS!';
    return '❌ 3 BUAH TERLEWAT JATUH!';
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="cyber-panel p-6 sm:p-8 max-w-lg w-full border-amber-600/70 shadow-[0_0_60px_rgba(255,140,0,0.35)] flex flex-col gap-5 text-center bg-stone-950/95 rounded-2xl">
        {/* Title */}
        <div>
          <div className="text-xs font-mono tracking-widest text-amber-400 uppercase mb-1 flex items-center justify-center gap-1.5">
            {isVersus ? <Crown className="w-4 h-4 text-amber-400" /> : <Swords className="w-4 h-4 text-orange-400" />}
            <span>// HASIL AKHIR PERTANDINGAN //</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black font-cyber drop-shadow ${
            winner === 'P1' ? 'text-cyan-400' : (winner === 'P2' ? 'text-rose-400' : 'text-amber-300')
          }`}>
            {getReasonTitle()}
          </h2>
        </div>

        {/* VERSUS MODE HEAD-TO-HEAD MATRIX */}
        {isVersus ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {/* P1 Box */}
              <div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1 ${
                winner === 'P1'
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                  : 'bg-black/50 border-stone-800 opacity-80'
              }`}>
                {winner === 'P1' && <Crown className="w-6 h-6 text-amber-400 mb-0.5 animate-bounce" />}
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase">PLAYER 1</span>
                <span className="text-3xl sm:text-4xl font-black font-cyber text-white">{p1Score.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 font-mono">Potongan: {p1Fruits} Buah</span>
              </div>

              {/* P2 Box */}
              <div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-1 ${
                winner === 'P2'
                  ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_20px_rgba(255,0,85,0.4)]'
                  : 'bg-black/50 border-stone-800 opacity-80'
              }`}>
                {winner === 'P2' && <Crown className="w-6 h-6 text-amber-400 mb-0.5 animate-bounce" />}
                <span className="text-xs font-mono font-bold text-rose-300 uppercase">PLAYER 2</span>
                <span className="text-3xl sm:text-4xl font-black font-cyber text-white">{p2Score.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 font-mono">Potongan: {p2Fruits} Buah</span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Total Buah Terpotong Bersama: <strong className="text-white">{p1Fruits + p2Fruits}</strong>
            </div>
          </div>
        ) : (
          /* SINGLE PLAYER OR COOP SCORE DISPLAY */
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-black/70 border border-amber-500/50 relative shadow-inner">
              {isNewHigh && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-stone-950 font-cyber font-black text-[10px] tracking-widest uppercase shadow-[0_0_15px_rgba(255,193,7,0.8)]">
                  ★ REKOR BARU! ★
                </div>
              )}
              <div className="text-xs font-mono text-amber-400/80 uppercase">
                {isCoop ? 'TOTAL SKOR TIM (CO-OP)' : 'SKOR AKHIR'}
              </div>
              <div className="text-4xl sm:text-5xl font-black font-cyber text-amber-300 drop-shadow mt-1">
                {score.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-black/50 border border-stone-800">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Swords className="w-3.5 h-3.5 text-orange-400" />
                  <span>BUAH TERPOTONG</span>
                </div>
                <div className="text-xl font-black font-cyber text-orange-300 mt-1">{fruitsSliced}</div>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-stone-800">
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>MAX COMBO</span>
                </div>
                <div className="text-xl font-black font-cyber text-yellow-300 mt-1">{maxCombo}x</div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-cyber font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            REMATCH / MAIN LAGI
          </button>
          <button
            onClick={onExitToMenu}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-slate-200 border border-stone-700 font-cyber font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            MENU UTAMA
          </button>
        </div>
      </div>
    </div>
  );
}
