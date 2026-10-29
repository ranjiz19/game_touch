// InputController.js - Dual-Player Spatial Hand Tracking & Independent Katana Blades

export class InputController {
  constructor(coordinateMapper) {
    this.mapper = coordinateMapper;

    // Player 1 Blade (Electric Blue / Cyan) - Left Side Player
    this.p1 = {
      pointer: null,
      prevPointer: null,
      velocity: 0,
      trail: [],
      lastSeenTime: 0,
      color: '#00f0ff',
      coreColor: '#ffffff',
      label: 'P1 (BIRU)'
    };

    // Player 2 Blade (Flame Crimson / Gold) - Right Side Player
    this.p2 = {
      pointer: null,
      prevPointer: null,
      velocity: 0,
      trail: [],
      lastSeenTime: 0,
      color: '#ff0055',
      coreColor: '#ffea00',
      label: 'P2 (MERAH)'
    };

    this.maxTrailLength = 16;
    this.maxTrailAge = 0.22; // 220ms trail duration
    this.smoothingFactor = 0.25; // Smooth movement without lag

    // Mouse fallback state
    this.isMouseDown = false;
    this.mousePointer = null;

    // Compatibility getters for single-player engine hooks
    this.currentPointer = null;
    this.prevPointer = null;
    this.currentVelocity = 0;
  }

  setupEventListeners(canvas) {
    if (!canvas) return;

    const getCanvasPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    const onMouseDown = (e) => {
      this.isMouseDown = true;
      this.mousePointer = getCanvasPos(e);
    };

    const onMouseUp = () => {
      this.isMouseDown = false;
      this.mousePointer = null;
    };

    const onMouseMove = (e) => {
      this.mousePointer = getCanvasPos(e);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);

    // Touchscreen swipe support
    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        this.isMouseDown = true;
        this.mousePointer = getCanvasPos(e.touches[0]);
      }
    };
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        this.mousePointer = getCanvasPos(e.touches[0]);
      }
    };
    const onTouchEnd = () => {
      this.isMouseDown = false;
      this.mousePointer = null;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    this.cleanupListeners = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }

  /**
   * Update individual player blade with independent smoothing and velocity
   */
  updatePlayerBlade(player, targetPoint, dt, now) {
    if (targetPoint) {
      if (!player.pointer) {
        player.pointer = { x: targetPoint.x, y: targetPoint.y };
        player.prevPointer = { x: targetPoint.x, y: targetPoint.y };
        player.velocity = 0;
      } else {
        player.prevPointer = { x: player.pointer.x, y: player.pointer.y };

        // Independent Exponential Moving Average Smoothing
        const alpha = 1.0 - this.smoothingFactor;
        player.pointer.x += (targetPoint.x - player.pointer.x) * alpha;
        player.pointer.y += (targetPoint.y - player.pointer.y) * alpha;

        if (dt > 0) {
          const dist = Math.hypot(
            player.pointer.x - player.prevPointer.x,
            player.pointer.y - player.prevPointer.y
          );
          const instantVel = dist / dt;
          player.velocity = player.velocity * 0.35 + instantVel * 0.65;
        }
      }

      player.lastSeenTime = now;
      player.trail.unshift({
        x: player.pointer.x,
        y: player.pointer.y,
        time: now,
        speed: player.velocity
      });
      if (player.trail.length > this.maxTrailLength) {
        player.trail.pop();
      }
    } else {
      // Grace period: keep previous pointer for 180ms across brief frame drops
      if (now - player.lastSeenTime > 0.18) {
        player.prevPointer = null;
        player.pointer = null;
        player.velocity = 0;
      }
    }

    // Prune expired trail points
    player.trail = player.trail.filter(pt => (now - pt.time) < this.maxTrailAge);
  }

  /**
   * Process detected hands with spatial 2-Person dual blade assignment
   * @param {Array} handsInput - array of hand landmark arrays from MediaPipe
   * @param {number} dt - delta time in seconds
   * @param {string} gameMode - CLASSIC, ARCADE, VERSUS, COOP
   */
  processLandmarks(handsInput, dt, gameMode = 'CLASSIC') {
    const now = performance.now() / 1000;
    const midX = (this.mapper.canvasWidth || 1920) / 2;
    const isMultiplayer = (gameMode === 'VERSUS' || gameMode === 'COOP');

    // 1. Normalize input
    let hands = [];
    if (Array.isArray(handsInput)) {
      if (handsInput.length > 0 && Array.isArray(handsInput[0])) {
        hands = handsInput; // Multiple hands [[pt0..pt20], [pt0..pt20]]
      } else if (handsInput.length >= 21) {
        hands = [handsInput]; // Single hand [pt0..pt20]
      }
    }

    // 2. Map all hand fingertips to canvas coordinates WITHOUT shared smoothing
    const mappedHands = [];
    for (const hand of hands) {
      if (hand && hand.length >= 21) {
        // Landmark 8 is Index Finger Tip
        const tip = this.mapper.mapPoint(hand[8], false);
        const wrist = this.mapper.mapPoint(hand[0], false);
        if (tip) {
          mappedHands.push({
            tip,
            wrist,
            x: tip.x,
            y: tip.y
          });
        }
      }
    }

    let p1Target = null;
    let p2Target = null;

    if (isMultiplayer) {
      // MULTIPLAYER MODE: 2 People in 1 Camera
      // Left side = Player 1 (Blue Blade), Right side = Player 2 (Red Blade)
      if (mappedHands.length > 0) {
        // Separate hands by screen half with a small 60px tolerance buffer
        const leftCandidates = mappedHands.filter(h => h.x < midX + 60);
        const rightCandidates = mappedHands.filter(h => h.x >= midX - 60);

        if (leftCandidates.length > 0 && rightCandidates.length > 0) {
          // Both sides have hands: pick highest (lowest y) or closest to previous pointer
          leftCandidates.sort((a, b) => a.y - b.y);
          rightCandidates.sort((a, b) => a.y - b.y);

          p1Target = leftCandidates[0].tip;
          // Ensure P2 doesn't pick the same hand if it was in the overlap zone
          const p2Filtered = rightCandidates.filter(h => h !== leftCandidates[0]);
          p2Target = (p2Filtered.length > 0 ? p2Filtered[0] : rightCandidates[0]).tip;
        } else if (mappedHands.length >= 2) {
          // Multiple hands detected, but clustered on one side: sort by X
          mappedHands.sort((a, b) => a.x - b.x);
          p1Target = mappedHands[0].tip;
          p2Target = mappedHands[mappedHands.length - 1].tip;
        } else {
          // Exactly 1 hand detected: assign based on which half of the screen it's on
          const singleHand = mappedHands[0];
          if (singleHand.x < midX) {
            p1Target = singleHand.tip;
          } else {
            p2Target = singleHand.tip;
          }
        }

        // Mouse fallback in multiplayer: if only 1 player is on camera, mouse can control the other player
        if (this.isMouseDown && this.mousePointer) {
          if (p1Target && !p2Target) {
            p2Target = this.mousePointer;
          } else if (!p1Target && p2Target) {
            p1Target = this.mousePointer;
          }
        }
      } else if (this.isMouseDown && this.mousePointer) {
        // No hands on camera, mouse controls P1 or P2 depending on click position
        if (this.mousePointer.x < midX) {
          p1Target = this.mousePointer;
        } else {
          p2Target = this.mousePointer;
        }
      }
    } else {
      // SINGLE PLAYER MODE: CLASSIC or ARCADE
      // The single player controls P1 (Blue Blade) anywhere on the entire screen!
      if (mappedHands.length > 0) {
        // If player has both hands up, pick highest/most active hand
        mappedHands.sort((a, b) => a.y - b.y);
        p1Target = mappedHands[0].tip;
      } else if (this.isMouseDown && this.mousePointer) {
        p1Target = this.mousePointer;
      }
      // P2 remains inactive in single-player
      p2Target = null;
    }

    // Update both blades independently with their own smoothing
    this.updatePlayerBlade(this.p1, p1Target, dt, now);
    this.updatePlayerBlade(this.p2, p2Target, dt, now);

    // Sync legacy single-player handles
    this.currentPointer = this.p1.pointer || this.p2.pointer;
    this.prevPointer = this.p1.prevPointer || this.p2.prevPointer;
    this.currentVelocity = this.p1.velocity || this.p2.velocity;
  }

  render(ctx) {
    this.renderBlade(ctx, this.p1);
    this.renderBlade(ctx, this.p2);
  }

  renderBlade(ctx, player) {
    if (player.trail.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const now = performance.now() / 1000;

    // Glowing Katana slash trail
    for (let i = 0; i < player.trail.length - 1; i++) {
      const pt1 = player.trail[i];
      const pt2 = player.trail[i + 1];
      const ageRatio = Math.max(0, 1 - (now - pt1.time) / this.maxTrailAge);
      const width = Math.max(3, 24 * ageRatio);

      // Outer Neon Aura
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.strokeStyle = player.color;
      ctx.globalAlpha = 0.55 * ageRatio;
      ctx.lineWidth = width * 1.8;
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 22;
      ctx.stroke();

      // Sharp Core Blade
      ctx.beginPath();
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.strokeStyle = player.coreColor;
      ctx.globalAlpha = 0.95 * ageRatio;
      ctx.lineWidth = width * 0.45;
      ctx.stroke();
    }

    // Blade Tip Sparkle with Player Badge
    if (player.pointer) {
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(player.pointer.x, player.pointer.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = player.coreColor;
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Floating P1 / P2 Badge above tip
      ctx.font = "900 13px 'Orbitron', sans-serif";
      ctx.fillStyle = player.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.textAlign = 'center';
      ctx.fillText(player.label, player.pointer.x, player.pointer.y - 16);
    }

    ctx.restore();
  }

  destroy() {
    if (this.cleanupListeners) {
      this.cleanupListeners();
    }
  }
}
