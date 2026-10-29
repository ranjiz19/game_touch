// CameraCalibration.jsx - Webcam Calibration & Motion Sensitivity Setup

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, RotateCcw, X, Eye, EyeOff, Shield, Zap } from 'lucide-react';
import { saveSettings, getSettings } from '../utils/storage.js';
import { TRACKING_STATUS } from '../hooks/useHandTracking.js';

export function CameraCalibration({
  isOpen,
  onClose,
  trackingState,
  onSettingsChanged
}) {
  const [settings, setSettings] = useState(getSettings());
  const canvasRef = useRef(null);

  const {
    status,
    errorMessage,
    videoRef,
    latestLandmarksRef,
    detectedHandCount
  } = trackingState;

  useEffect(() => {
    if (isOpen) {
      setSettings(getSettings());
    }
  }, [isOpen]);

  // Render camera preview + hand skeleton on calibration canvas
  useEffect(() => {
    if (!isOpen) return;
    let animId;

    const renderPreview = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (canvas && video && video.readyState >= 2) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.save();

        // Mirror preview if enabled
        if (settings.mirrorMode) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }

        // Draw webcam frame
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        // Draw landmark skeleton if hand detected
        const lm = latestLandmarksRef.current;
        if (lm && lm.length >= 21) {
          ctx.save();
          // Draw connections
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2;

          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],       // Index
            [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [9, 13], [13, 14], [14, 15], [15, 16],// Ring
            [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
            [0, 17]                               // Palm base
          ];

          connections.forEach(([i, j]) => {
            const p1 = lm[i];
            const p2 = lm[j];
            const x1 = (settings.mirrorMode ? (1 - p1.x) : p1.x) * w;
            const y1 = p1.y * h;
            const x2 = (settings.mirrorMode ? (1 - p2.x) : p2.x) * w;
            const y2 = p2.y * h;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          });

          // Draw joints
          lm.forEach((pt, idx) => {
            const x = (settings.mirrorMode ? (1 - pt.x) : pt.x) * w;
            const y = pt.y * h;

            ctx.beginPath();
            ctx.arc(x, y, idx === 8 ? 6 : (idx === 0 ? 5 : 3), 0, Math.PI * 2);
            ctx.fillStyle = idx === 8 ? '#ff007f' : '#00f0ff';
            ctx.fill();
          });

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, videoRef, latestLandmarksRef, settings.mirrorMode]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
    if (onSettingsChanged) onSettingsChanged(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="cyber-panel p-6 max-w-2xl w-full border-cyan-500/60 shadow-[0_0_50px_rgba(0,240,255,0.2)] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-cyber font-bold text-lg">
            <Camera className="w-5 h-5" />
            <span>KALIBRASI WEBCAM & SENSOR GESTUR</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Live Preview Area */}
        <div className="relative aspect-video w-full bg-slate-950 rounded border border-cyan-500/40 overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-cover"
          />

          {/* Status Overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 bg-black/75 backdrop-blur border border-cyan-500/40 rounded text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${status === TRACKING_STATUS.READY ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300">STATUS: {status}</span>
          </div>

          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/75 backdrop-blur border border-cyan-500/40 rounded text-xs font-mono text-cyan-300">
            HANDS DETECTED: {detectedHandCount}
          </div>

          {errorMessage && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 text-center text-rose-400 text-sm font-sub">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Calibration Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sub">
          {/* Sensitivity */}
          <div className="flex flex-col gap-1.5 cyber-panel p-3 bg-black/40 border-slate-800">
            <div className="flex justify-between font-mono text-slate-300">
              <span>SENSITIVITAS GERAKAN</span>
              <span className="text-cyan-400 font-bold">{settings.sensitivity.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.05"
              value={settings.sensitivity}
              onChange={(e) => handleChange('sensitivity', parseFloat(e.target.value))}
              className="accent-cyan-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">
              Nilai lebih tinggi memudahkan tangan menjangkau sudut layar.
            </span>
          </div>

          {/* Smoothing */}
          <div className="flex flex-col gap-1.5 cyber-panel p-3 bg-black/40 border-slate-800">
            <div className="flex justify-between font-mono text-slate-300">
              <span>PENYARING GETARAN (SMOOTHING)</span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.smoothing * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={settings.smoothing}
              onChange={(e) => handleChange('smoothing', parseFloat(e.target.value))}
              className="accent-cyan-400 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400">
              Menghaluskan jejak pedang energi dan mengurangi tremor tangan.
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
            <input
              type="checkbox"
              checked={settings.mirrorMode}
              onChange={(e) => handleChange('mirrorMode', e.target.checked)}
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
            />
            <span>MODE CERMIN (MIRROR FEED)</span>
          </label>

          <button
            onClick={onClose}
            className="cyber-btn text-xs py-2 px-6"
          >
            <Check className="w-4 h-4" />
            SIMPAN & SELESAI
          </button>
        </div>
      </div>
    </div>
  );
}

