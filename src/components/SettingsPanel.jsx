// SettingsPanel.jsx - Audio, Fruit Speed & Performance Preferences

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sparkles, Sliders, RotateCcw, Check, Gauge, FastForward } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage.js';

export function SettingsPanel({ isOpen, onClose, onSettingsChanged }) {
  const [settings, setSettings] = useState(getSettings());

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  const handleReset = () => {
    const defaults = {
      soundEnabled: true,
      sfxVolume: 0.8,
      bgmVolume: 0.4,
      particleDensity: 'high',
      mirrorMode: true,
      sensitivity: 1.25,
      smoothing: 0.35,
      fruitSpeed: 1.0,
      showWebcamPreview: true
    };
    setSettings(defaults);
    saveSettings(defaults);
    if (onSettingsChanged) onSettingsChanged(defaults);
  };

  const getSpeedLabel = (spd) => {
    if (spd <= 0.8) return 'SANTAI / SLOW (Sangat Mudah)';
    if (spd >= 1.2) return 'CEPAT (Tantangan Refleks)';
    return 'NORMAL (Floaty & Seimbang)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="cyber-panel p-6 max-w-lg w-full border-amber-600/70 shadow-[0_0_50px_rgba(255,140,0,0.3)] flex flex-col gap-5 bg-stone-950/95 rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-cyber font-bold text-lg">
            <Sliders className="w-5 h-5" />
            <span>PENGATURAN GAME & KECEPATAN</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Fruit Speed & Gameplay Tuning */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono text-amber-400 tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>// KECEPATAN & KEMUDAHAN BUAH</span>
          </div>

          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/60 border border-amber-600/40">
            <div className="flex justify-between font-mono text-xs text-amber-200">
              <span>KECEPATAN LEMPARAN BUAH</span>
              <span className="font-bold text-amber-400 font-cyber">
                {settings.fruitSpeed?.toFixed(2) || '1.00'}x — {getSpeedLabel(settings.fruitSpeed || 1.0)}
              </span>
            </div>

            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.05"
              value={settings.fruitSpeed || 1.0}
              onChange={(e) => handleChange('fruitSpeed', parseFloat(e.target.value))}
              className="accent-amber-400 cursor-pointer w-full"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
              <span>0.6x (Sangat Santai & Melayang)</span>
              <span>1.0x (Normal)</span>
              <span>1.4x (Cepat)</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1.5">
              <button
                onClick={() => handleChange('fruitSpeed', 0.75)}
                className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                  (settings.fruitSpeed || 1.0) <= 0.8
                    ? 'border-amber-400 bg-amber-500/30 text-amber-200 font-bold'
                    : 'border-stone-800 text-slate-400 hover:bg-stone-900'
                }`}
              >
                🐢 SANTAI (0.75x)
              </button>
              <button
                onClick={() => handleChange('fruitSpeed', 1.0)}
                className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                  (settings.fruitSpeed || 1.0) > 0.8 && (settings.fruitSpeed || 1.0) < 1.2
                    ? 'border-amber-400 bg-amber-500/30 text-amber-200 font-bold'
                    : 'border-stone-800 text-slate-400 hover:bg-stone-900'
                }`}
              >
                ⚖️ NORMAL (1.0x)
              </button>
              <button
                onClick={() => handleChange('fruitSpeed', 1.25)}
                className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                  (settings.fruitSpeed || 1.0) >= 1.2
                    ? 'border-amber-400 bg-amber-500/30 text-amber-200 font-bold'
                    : 'border-stone-800 text-slate-400 hover:bg-stone-900'
                }`}
              >
                ⚡ CEPAT (1.25x)
              </button>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-mono text-amber-400 tracking-wider">
            // SUARA & EFEK AUDIO
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-stone-800 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>EFEK SUARA TEBASAN & GONG</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
              className="accent-amber-400 w-4 h-4 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-black/40 border border-stone-800 text-xs">
            <div className="flex justify-between font-mono text-slate-300">
              <span>VOLUME EFEK (SFX)</span>
              <span className="text-amber-400 font-bold">{Math.round((settings.sfxVolume ?? 0.8) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={!settings.soundEnabled}
              value={settings.sfxVolume ?? 0.8}
              onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
              className="accent-amber-400 cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-2 border-t border-stone-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET DEFAULT
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-cyber font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Check className="w-4 h-4" />
            SIMPAN & SELESAI
          </button>
        </div>
      </div>
    </div>
  );
}
