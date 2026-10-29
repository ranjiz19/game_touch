# 🍉 Slicey — Motion & Multiplayer Edition
Game aksi-refleks berbasis web di mana Anda mengayunkan tangan di depan webcam layaknya pedang tajam untuk memotong buah-buahan segar yang melambung di udara, baik solo maupun duel 2 pemain di satu kamera.

---

## 🌟 Fitur Utama

- 🥷 **Motion Tracking AI (MediaPipe)**: Deteksi gestur tangan dan jari secara real-time pada 60 FPS via model `HandLandmarker` GPU.
- 👥 **Multiplayer 2 Pemain (1 Webcam)**: Dua orang bermain berdampingan di depan satu webcam. Pemain 1 mengendalikan **Pedang Biru**, Pemain 2 mengendalikan **Pedang Merah**.
- 🍉 **Fisika Buah & Partikel**: Potongan buah membelah dinamis mengikuti sudut ayunan, disertai cipratan sari buah (*juice splatter*).
- 📷 **Augmented Reality Transparan**: Latar belakang webcam menyatu dengan dojo kayu secara proporsional (*Aspect-Cover* tanpa distorsi).
- 🔊 **Procedural Web Audio**: Efek tebasan pedang, cipratan buah, gong kombo, dan bom disintesis murni via Web Audio API tanpa file audio eksternal.
- ⚙️ **Pengaturan Kecepatan**: Pilihan ritme buah santai (0.75x), normal (1.0x), hingga cepat (1.25x).

---

## 🎮 Mode Permainan

| Mode | Format | Aturan Main |
| :--- | :---: | :--- |
| **CLASSIC** | 1 Pemain | 3 Nyawa. Terlewat 3 buah atau menebas bom = Game Over. |
| **ARCADE** | 1 Pemain | Tantangan waktu 60 detik. Tebas sebanyak mungkin, bom = -250 poin. |
| **⚔️ VERSUS DUEL** | 2 Pemain | Perebutan poin 60 detik di depan 1 webcam. Skor tertinggi menang! |
| **🤝 CO-OP RUSH** | 2 Pemain | Kerja sama 2 pemain mengumpulkan total skor dan kombo ganda. |

---

## 🕹️ Kontrol

- **Webcam**: Ayunkan telunjuk atau tangan melintasi buah untuk menebas.
  - *Mode 2P*: Pemain sisi kiri = Pedang Biru (P1), Pemain sisi kanan = Pedang Merah (P2).
- **Mouse**: Klik kiri, tahan dan geser kursor untuk memotong.
- **Keyboard**: Tekan `Escape` atau `P` untuk Pause / Resume.

---

## 🚀 Panduan Menjalankan

### Persyaratan
- Node.js v18 atau lebih baru.
- Browser modern (Google Chrome, Microsoft Edge, Brave) dengan akses webcam.

### Instalasi & Dev Server
```bash
# 1. Clone repository
git clone https://github.com/ranjiz19/game_touch.git

# 2. Pasang dependensi
npm install

# 3. Jalankan server lokal
npm run dev
```

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Vision AI**: `@mediapipe/tasks-vision` (Hand Landmarker)
- **Engine**: Native HTML5 Canvas 2D API (Delta-Time Loop)
- **Audio**: Web Audio API (Synthesizer Prosedural)
- **Tooling**: Vite 8
