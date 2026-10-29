// GameEngine.js - Fruit Ninja Motion Game Engine with Multiplayer Duel & Co-op Support

import { Fruit, FruitHalf, FRUIT_TYPE } from './FruitFactory.js';
import { ParticleSystem } from './ParticleSystem.js';
import { CollisionSystem } from './CollisionSystem.js';
import { InputController } from './InputController.js';
import { CoordinateMapper } from '../utils/coordinateMapper.js';
import { audio } from './SoundSystem.js';
import { saveHighScore } from '../utils/storage.js';

export const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER'
};

export const GAME_MODE = {
  CLASSIC: 'CLASSIC', // 1P 3 Strikes, Bombs = Game Over
  ARCADE: 'ARCADE',   // 1P 60s Blitz
  VERSUS: 'VERSUS',   // 2P Duel (P1 vs P2 60s)
  COOP: 'COOP'        // 2P Teamwork Shared Score (60s)
};

export class GameEngine {
  constructor(canvas, onHudUpdate) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onHudUpdate = onHudUpdate || (() => {});

    this.state = GAME_STATE.MENU;
    this.mode = GAME_MODE.CLASSIC;

    // Subsystems
    this.coordinateMapper = new CoordinateMapper({
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      mirror: true,
      sensitivity: 1.25,
      smoothingFactor: 0.35
    });
    this.input = new InputController(this.coordinateMapper);
    this.particles = new ParticleSystem(400);
    this.collision = new CollisionSystem();

    // Single Player Stats
    this.score = 0;
    this.strikes = 0;
    this.maxStrikes = 3;
    this.arcadeTimer = 60.0;
    this.fruitsSlicedCount = 0;
    this.maxCombo = 0;

    // Multiplayer Stats
    this.p1Score = 0;
    this.p2Score = 0;
    this.p1Fruits = 0;
    this.p2Fruits = 0;

    // Entity lists
    this.fruits = [];
    this.halves = [];

    // Wave spawning
    this.waveTimer = 0;
    this.waveInterval = 3.2;
    this.waveCount = 0;
    this.difficulty = 1.0;

    // Combo tracking
    this.p1ComboFruits = [];
    this.p1ComboTimer = 0;
    this.p2ComboFruits = [];
    this.p2ComboTimer = 0;

    // Screen effects
    this.shakeIntensity = 0;
    this.flashWhiteAlpha = 0;

    // Translucent Camera & Background blending
    this.cameraOpacity = 0.65;
    this.fruitSpeedMultiplier = 1.0;

    this.input.setupEventListeners(canvas);
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.coordinateMapper.setDimensions(width, height);
  }

  setCameraOpacity(opacity) {
    this.cameraOpacity = Math.max(0, Math.min(1, opacity));
  }

  setFruitSpeed(multiplier) {
    this.fruitSpeedMultiplier = Math.max(0.5, Math.min(2.0, multiplier));
  }

  startNewGame(mode = GAME_MODE.CLASSIC) {
    this.mode = mode;
    this.state = GAME_STATE.PLAYING;
    this.score = 0;
    this.strikes = 0;
    this.arcadeTimer = 60.0;
    this.fruitsSlicedCount = 0;
    this.maxCombo = 0;

    // Reset Multiplayer Stats
    this.p1Score = 0;
    this.p2Score = 0;
    this.p1Fruits = 0;
    this.p2Fruits = 0;

    this.fruits = [];
    this.halves = [];
    this.particles.clear();
    this.waveTimer = 1.0;
    this.waveInterval = 3.2;
    this.waveCount = 0;
    this.difficulty = 1.0;
    this.shakeIntensity = 0;
    this.flashWhiteAlpha = 0;

    audio.init();
    audio.playComboGong(1);
  }

  pauseGame() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
    }
  }

  resumeGame() {
    if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
    }
  }

  triggerGameOver(reason = 'strikes') {
    this.state = GAME_STATE.GAMEOVER;

    let winner = null;
    if (this.mode === GAME_MODE.VERSUS) {
      if (this.p1Score > this.p2Score) winner = 'P1';
      else if (this.p2Score > this.p1Score) winner = 'P2';
      else winner = 'DRAW';
    }

    const finalScore = this.mode === GAME_MODE.COOP ? (this.p1Score + this.p2Score) : this.score;
    const isNewHigh = saveHighScore(finalScore);

    this.onHudUpdate({
      type: 'GAMEOVER',
      stats: {
        mode: this.mode,
        score: finalScore,
        isNewHigh,
        fruitsSliced: this.fruitsSlicedCount,
        maxCombo: this.maxCombo,
        reason,
        winner,
        p1Score: this.p1Score,
        p2Score: this.p2Score,
        p1Fruits: this.p1Fruits,
        p2Fruits: this.p2Fruits
      }
    });
  }

  // --- SPAWNING SYSTEM ---

  spawnWave() {
    this.waveCount++;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Multiplayer modes spawn slightly more fruits for intense competition
    const isMulti = this.mode === GAME_MODE.VERSUS || this.mode === GAME_MODE.COOP;
    let count = 1;
    if (this.waveCount <= 2) {
      count = isMulti ? 2 : 1;
    } else if (this.waveCount <= 5) {
      count = isMulti ? 3 : (Math.random() > 0.45 ? 2 : 1);
    } else {
      count = isMulti ? 3 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * (this.difficulty > 2.5 ? 2 : 1));
    }

    const types = [
      FRUIT_TYPE.WATERMELON,
      FRUIT_TYPE.ORANGE,
      FRUIT_TYPE.APPLE,
      FRUIT_TYPE.BANANA,
      FRUIT_TYPE.STRAWBERRY,
      FRUIT_TYPE.PINEAPPLE,
      FRUIT_TYPE.COCONUT
    ];

    const bombChance = this.waveCount <= 3 ? 0 : (this.mode === GAME_MODE.CLASSIC ? 0.20 : 0.35);
    const hasBomb = Math.random() < bombChance;

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      this.tossFruit(type, w, h, i, count);
    }

    if (hasBomb) {
      this.tossFruit(FRUIT_TYPE.BOMB, w, h, count, count + 1);
    }

    this.waveInterval = Math.max(2.0, 3.4 - this.difficulty * 0.1);
  }

  tossFruit(type, w, h, index, total) {
    const margin = w * 0.18;
    const step = (w - margin * 2) / Math.max(1, total - 1);
    const x = margin + step * index + (Math.random() - 0.5) * 50;
    const y = h + 50;

    const currentGravity = 360 * this.fruitSpeedMultiplier;
    const targetPeakHeight = h * (0.60 + Math.random() * 0.14);
    const vy = -Math.sqrt(2 * currentGravity * targetPeakHeight);

    const centerBias = (w / 2 - x) * 0.32;
    const vx = centerBias + (Math.random() - 0.5) * 70;

    const fruit = new Fruit(type, x, y, vx, vy);
    fruit.customGravity = currentGravity;
    this.fruits.push(fruit);
  }

  // --- MAIN LOOP ---

  update(dt, rawLandmarks = null, videoElement = null) {
    if (videoElement && videoElement.videoWidth > 0) {
      this.coordinateMapper.setVideoDimensions(videoElement.videoWidth, videoElement.videoHeight);
    }

    // 1. Process hand/mouse input for both P1 and P2 with game mode awareness
    this.input.processLandmarks(rawLandmarks, dt, this.mode);

    // Audio whoosh when swinging fast
    if ((this.input.p1.velocity > 320 || this.input.p2.velocity > 320) && Math.random() < 0.25) {
      audio.playWhoosh();
    }

    // Screen FX decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 35);
    }
    if (this.flashWhiteAlpha > 0) {
      this.flashWhiteAlpha = Math.max(0, this.flashWhiteAlpha - dt * 2.5);
    }

    if (this.state !== GAME_STATE.PLAYING) return;

    this.difficulty += dt * 0.03;

    // Timer countdown for Arcade, Versus & Coop modes
    if (this.mode !== GAME_MODE.CLASSIC) {
      this.arcadeTimer -= dt;
      if (this.arcadeTimer <= 0) {
        this.triggerGameOver('time');
        return;
      }
    }

    // 2. Wave Spawner
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.spawnWave();
      this.waveTimer = this.waveInterval;
    }

    // 3. Process Combo Windows for P1 & P2
    this.p1ComboTimer -= dt;
    if (this.p1ComboTimer <= 0 && this.p1ComboFruits.length > 0) {
      const c = this.p1ComboFruits.length;
      if (c >= 3) {
        const bonus = c * 100;
        this.p1Score += bonus;
        if (this.mode === GAME_MODE.COOP) this.score += bonus;
        else if (this.mode !== GAME_MODE.VERSUS) this.score += bonus;
        audio.playComboGong(c);
        this.particles.spawnScore(`P1 ${c}x COMBO! +${bonus}`, this.input.p1.pointer?.x || 200, 200, '#00f0ff');
      }
      this.p1ComboFruits = [];
    }

    this.p2ComboTimer -= dt;
    if (this.p2ComboTimer <= 0 && this.p2ComboFruits.length > 0) {
      const c = this.p2ComboFruits.length;
      if (c >= 3) {
        const bonus = c * 100;
        this.p2Score += bonus;
        if (this.mode === GAME_MODE.COOP) this.score += bonus;
        audio.playComboGong(c);
        this.particles.spawnScore(`P2 ${c}x COMBO! +${bonus}`, this.input.p2.pointer?.x || 700, 200, '#ff0055');
      }
      this.p2ComboFruits = [];
    }

    // 4. Update & Collide Fruits with Dual Blades (checks direct tip, current stroke, and recent trail)
    for (let i = this.fruits.length - 1; i >= 0; i--) {
      const fruit = this.fruits[i];
      fruit.update(dt, fruit.customGravity || 360 * this.fruitSpeedMultiplier);

      // Check Blade 1 (Player 1)
      let p1Slice = this.collision.checkBladeSlice(this.input.p1, fruit);
      // Check Blade 2 (Player 2)
      let p2Slice = this.collision.checkBladeSlice(this.input.p2, fruit);

      if (p1Slice || p2Slice) {
        fruit.isSliced = true;

        // If both cut the same fruit, award to the faster blade
        let isP1 = true;
        if (p1Slice && p2Slice) {
          isP1 = (this.input.p1.velocity >= this.input.p2.velocity);
        } else if (p2Slice) {
          isP1 = false;
        }

        const sliceInfo = isP1 ? p1Slice : p2Slice;
        const cutter = isP1 ? 'P1' : 'P2';
        const cutterColor = isP1 ? '#00f0ff' : '#ff0055';

        // BOMB DETONATION!
        if (fruit.type === FRUIT_TYPE.BOMB) {
          audio.playBombExplosion();
          this.shakeIntensity = 30;
          this.flashWhiteAlpha = 0.85;
          this.particles.spawnBombExplosion(fruit.x, fruit.y);

          if (this.mode === GAME_MODE.CLASSIC) {
            this.triggerGameOver('bomb');
            return;
          } else if (this.mode === GAME_MODE.VERSUS) {
            // In Versus: deduct 250 points from the player who cut the bomb!
            if (isP1) {
              this.p1Score = Math.max(0, this.p1Score - 250);
              this.particles.spawnScore('P1 BOMB! -250', fruit.x, fruit.y, '#00f0ff');
            } else {
              this.p2Score = Math.max(0, this.p2Score - 250);
              this.particles.spawnScore('P2 BOMB! -250', fruit.x, fruit.y, '#ff0055');
            }
          } else if (this.mode === GAME_MODE.COOP) {
            this.p1Score = Math.max(0, this.p1Score - 125);
            this.p2Score = Math.max(0, this.p2Score - 125);
            this.score = Math.max(0, this.score - 250);
            this.particles.spawnScore('CO-OP BOMB! -250', fruit.x, fruit.y, '#ff3344');
          } else {
            this.score = Math.max(0, this.score - 250);
            this.particles.spawnScore('-250!', fruit.x, fruit.y, '#ff0033');
          }

          this.fruits.splice(i, 1);
          continue;
        }

        // REGULAR FRUIT CUT!
        this.fruitsSlicedCount++;
        const pts = fruit.config.points;

        if (isP1) {
          this.p1Fruits++;
          this.p1Score += pts;
          this.p1ComboFruits.push(fruit.type);
          this.p1ComboTimer = 0.32;
        } else {
          this.p2Fruits++;
          this.p2Score += pts;
          this.p2ComboFruits.push(fruit.type);
          this.p2ComboTimer = 0.32;
        }

        if (this.mode === GAME_MODE.COOP) {
          this.score = this.p1Score + this.p2Score;
        } else if (this.mode === GAME_MODE.VERSUS) {
          this.score = this.p1Score;
        } else {
          this.score += pts;
        }

        audio.playFruitSlice();

        // Spawn 2 Cut Halves that fly apart
        const pushSpeed = 160;
        const perp = sliceInfo.perpAngle;
        const leftVx = fruit.vx + Math.cos(perp) * -pushSpeed;
        const leftVy = fruit.vy + Math.sin(perp) * -pushSpeed;
        const rightVx = fruit.vx + Math.cos(perp) * pushSpeed;
        const rightVy = fruit.vy + Math.sin(perp) * pushSpeed;

        this.halves.push(new FruitHalf(fruit.type, fruit.x, fruit.y, leftVx, leftVy, 'left', sliceInfo.cutAngle));
        this.halves.push(new FruitHalf(fruit.type, fruit.x, fruit.y, rightVx, rightVy, 'right', sliceInfo.cutAngle));

        this.particles.spawnFruitJuice(fruit.x, fruit.y, fruit.config.juiceColor, fruit.config.splatColor);
        const tag = this.mode === GAME_MODE.VERSUS ? `+${pts} (${cutter})` : `+${pts}`;
        this.particles.spawnScore(tag, fruit.x, fruit.y - 15, cutterColor);

        this.fruits.splice(i, 1);
        continue;
      }

      // Check dropped below bottom screen
      if (fruit.y > this.canvas.height + 80 && fruit.vy > 0) {
        if (fruit.type !== FRUIT_TYPE.BOMB) {
          if (this.mode === GAME_MODE.CLASSIC) {
            this.strikes++;
            audio.playFruitDropMiss();
            this.particles.spawnScore('❌ MISS', fruit.x, this.canvas.height - 40, '#ff3344');

            if (this.strikes >= this.maxStrikes) {
              this.triggerGameOver('strikes');
              return;
            }
          }
        }
        this.fruits.splice(i, 1);
      }
    }

    // 5. Update Halves & Particles
    for (let i = this.halves.length - 1; i >= 0; i--) {
      this.halves[i].update(dt, 480 * this.fruitSpeedMultiplier);
      if (this.halves[i].life <= 0 || this.halves[i].y > this.canvas.height + 100) {
        this.halves.splice(i, 1);
      }
    }

    this.particles.update(dt);

    // 6. Dispatch HUD data
    this.onHudUpdate({
      type: 'TICK',
      score: this.mode === GAME_MODE.COOP ? (this.p1Score + this.p2Score) : (this.mode === GAME_MODE.VERSUS ? this.p1Score : this.score),
      strikes: this.strikes,
      maxStrikes: this.maxStrikes,
      mode: this.mode,
      arcadeTimer: Math.ceil(this.arcadeTimer),
      fruitsSliced: this.fruitsSlicedCount,
      p1Score: this.p1Score,
      p2Score: this.p2Score,
      p1Fruits: this.p1Fruits,
      p2Fruits: this.p2Fruits
    });
  }

  // --- RENDER PASS ---

  render(videoElement = null) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    if (this.shakeIntensity > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity;
      const sy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(sx, sy);
    }

    // 1. Render Blended Background: Live Camera (Aspect-Cover) + Translucent Dojo Wood
    const hasCamera = videoElement && videoElement.readyState >= 2 && this.cameraOpacity > 0;
    if (hasCamera) {
      const vw = videoElement.videoWidth || 1280;
      const vh = videoElement.videoHeight || 720;
      const canvasAspect = w / h;
      const videoAspect = vw / vh;

      let sx = 0, sy = 0, sWidth = vw, sHeight = vh;
      if (canvasAspect > videoAspect) {
        sWidth = vw;
        sHeight = vw / canvasAspect;
        sx = 0;
        sy = (vh - sHeight) / 2;
      } else {
        sHeight = vh;
        sWidth = vh * canvasAspect;
        sx = (vw - sWidth) / 2;
        sy = 0;
      }

      ctx.save();
      ctx.globalAlpha = this.cameraOpacity;
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoElement, sx, sy, sWidth, sHeight, 0, 0, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1c1008';
      ctx.fillRect(0, 0, w, h);
    }

    // Overlay Dojo Wood Planks & Calligraphy semi-transparently on top
    const dojoAlpha = hasCamera ? Math.max(0.18, 1.0 - this.cameraOpacity * 0.7) : 1.0;
    if (dojoAlpha > 0.02) {
      ctx.save();
      ctx.globalAlpha = dojoAlpha;
      this.renderDojoBackground(ctx, w, h);
      ctx.restore();
    }

    // 2. Render Juice Splats on Wall
    this.particles.renderSplats(ctx);

    // 3. Render Sliced Halves
    for (const half of this.halves) {
      half.render(ctx);
    }

    // 4. Render Active Whole Fruits
    for (const fruit of this.fruits) {
      fruit.render(ctx);
    }

    // 5. Render Juice Droplets & Floating Scores
    this.particles.renderParticles(ctx);

    // 6. Render Dual Katana Blade Slash Trails (P1 Cyan, P2 Crimson)
    this.input.render(ctx);

    // 7. Bomb Explosion White Flash
    if (this.flashWhiteAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashWhiteAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }

  renderDojoBackground(ctx, w, h) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2d1a10');
    grad.addColorStop(0.5, '#402617');
    grad.addColorStop(1, '#1f1109');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 3;
    const plankHeight = 90;
    for (let y = plankHeight; y < h; y += plankHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Dojo background wood planks clean aesthetic
  }

  destroy() {
    this.input.destroy();
    audio.destroy();
  }
}
