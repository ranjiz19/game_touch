// TutorialModal.jsx - Fruit Slice Ninja How to Play Guide

import React from 'react';
import { X, Swords, Zap, AlertTriangle, Camera, MousePointer, CheckCircle } from 'lucide-react';

export function TutorialModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      <div className="cyber-panel p-6 max-w-lg w-full border-amber-600/70 shadow-[0_0_50px_rgba(255,140,0,0.3)] flex flex-col gap-5 bg-stone-950/95 rounded-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5 text-amber-400 font-cyber font-bold text-lg">
            <Swords className="w-5 h-5" />
            <span>PANDUAN BERMAIN FRUIT NINJA</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Rules */}
        <div className="flex flex-col gap-3 text-xs sm:text-sm font-sub text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-stone-800">
            <Swords className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">1. Ayunkan Tangan / Jari di Depan Kamera</strong>
              Ayunkan telunjuk atau tangan Anda dengan cepat di depan webcam seperti pedang katana untuk memotong buah segar yang terlempar ke udara.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-stone-800">
            <Zap className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-yellow-300 font-bold block mb-0.5">2. Combo Potongan Ganda!</strong>
              Potong 3 buah atau lebih dalam satu ayunan cepat untuk memicu COMBO dan mendapatkan ratusan bonus skor!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-stone-800">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-red-400 font-bold block mb-0.5">3. AWAS BOM HITAM!</strong>
              Jangan potong bom hitam! Pada Classic Mode, memotong bom akan langsung meledakkan game (Game Over).
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-stone-800">
            <Camera className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 font-bold block mb-0.5">4. Fitur AR Kamera (Augmented Reality)</strong>
              Tekan tombol <strong>KAMERA</strong> di pojok kanan atas untuk mengatur transparansi latar belakang kamera Anda (0% - 100%).
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-stone-800">
            <Swords className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-cyan-300 font-bold block mb-0.5">5. Mode Multiplayer 2 Pemain (Versus & Co-Op)</strong>
              Dua orang dapat berdiri berdampingan di depan webcam yang sama! Pemain di sisi kiri mengendalikan <span className="text-cyan-400 font-bold">Katana Biru (P1)</span> dan sisi kanan mengendalikan <span className="text-rose-400 font-bold">Katana Merah (P2)</span>. Atau P2 dapat menggunakan mouse!
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-stone-800">
            <MousePointer className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block mb-0.5">6. Dukungan Mouse / Touchscreen</strong>
              Jika bermain tanpa webcam, tahan tombol klik kiri mouse dan gesekkan (*swipe*) kursor ke arah buah.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-cyber font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            SAYA SIAP MEMOTONG!
          </button>
        </div>
      </div>
    </div>
  );
}
