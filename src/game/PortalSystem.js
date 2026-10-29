// PortalSystem.js - Dimensional Rift & Dynamic Seal Breach Engine

export const PORTAL_DIRECTIVE = {
  SLICE_CYAN: 'SLICE_CYAN',
  SLICE_MAGENTA: 'SLICE_MAGENTA',
  DEFEND_SURGE: 'DEFEND_SURGE',
  DRAW_SEAL: 'DRAW_SEAL'
};

export const SEAL_TYPES = [
  {
    id: 'DELTA',
    name: 'DELTA SEAL (三角)',
    // Normalized coordinates [0..1] relative to seal bounding box
    points: [
      { x: 0.5, y: 0.1 },
      { x: 0.9, y: 0.85 },
      { x: 0.1, y: 0.85 },
      { x: 0.5, y: 0.1 }
    ]
  },
  {
    id: 'CIRCLE',
    name: 'RING SEAL (円環)',
    points: [
      { x: 0.5, y: 0.1 },
      { x: 0.85, y: 0.35 },
      { x: 0.85, y: 0.75 },
      { x: 0.5, y: 0.95 },
      { x: 0.15, y: 0.75 },
      { x: 0.15, y: 0.35 },
      { x: 0.5, y: 0.1 }
    ]
  },
  {
    id: 'DIAMOND',
    name: 'DIAMOND SEAL (菱形)',
    points: [
      { x: 0.5, y: 0.1 },
      { x: 0.88, y: 0.5 },
      { x: 0.5, y: 0.9 },
      { x: 0.12, y: 0.5 },
      { x: 0.5, y: 0.1 }
    ]
  },
  {
    id: 'Z_RUNE',
    name: 'Z-RUNE (雷光)',
    points: [
      { x: 0.15, y: 0.2 },
      { x: 0.85, y: 0.2 },
      { x: 0.15, y: 0.8 },
      { x: 0.85, y: 0.8 }
    ]
  }
];

export class PortalSystem {
  constructor() {
    this.stability = 100; // 0 - 100%
    this.maxStability = 100;
    this.rotation = 0;
    this.pulsePhase = 0;
    this.activeDirective = PORTAL_DIRECTIVE.SLICE_CYAN;
    this.directiveTimer = 0;
    this.directiveDuration = 14; // Changes every 14 seconds

    // Seal breach mechanics
    this.activeSeal = null;
    this.sealProgress = 0; // 0..1
    this.currentWaypointIndex = 0;
    this.sealTimer = 0;
    this.sealMaxTime = 7.0; // 7 seconds to complete seal
    this.sealTolerance = 55; // pixels tolerance around waypoint

    // Dimension position (usually canvas center)
    this.cx = 960;
    this.cy = 540;
    this.baseRadius = 140;
  }

  resize(width, height) {
    this.cx = width / 2;
    this.cy = height / 2;
    this.baseRadius = Math.min(width, height) * 0.16;
  }

  reset() {
    this.stability = 100;
    this.rotation = 0;
    this.activeDirective = PORTAL_DIRECTIVE.SLICE_CYAN;
    this.directiveTimer = 0;
    this.activeSeal = null;
    this.sealProgress = 0;
  }

  damage(amount) {
    this.stability = Math.max(0, this.stability - amount);
    return this.stability <= 0;
  }

  heal(amount) {
    this.stability = Math.min(this.maxStability, this.stability + amount);
  }

  triggerSealBreach() {
    if (this.activeSeal) return; // already in seal mode
    const chosen = SEAL_TYPES[Math.floor(Math.random() * SEAL_TYPES.length)];
    this.activeSeal = {
      ...chosen,
      pixelPoints: this.calculateSealPixelPoints(chosen.points)
    };
    this.activeDirective = PORTAL_DIRECTIVE.DRAW_SEAL;
    this.currentWaypointIndex = 0;
    this.sealProgress = 0;
    this.sealTimer = this.sealMaxTime;
  }

  calculateSealPixelPoints(points) {
    const sealSize = this.baseRadius * 1.9;
    const startX = this.cx - sealSize / 2;
    const startY = this.cy - sealSize / 2;

    return points.map(pt => ({
      x: startX + pt.x * sealSize,
      y: startY + pt.y * sealSize
    }));
  }

  /**
   * Process player index pointer tracing progress during a seal breach
   * @param {Object} pointer - { x, y } in canvas coords
   * @returns {Object} { hitWaypoint, completed, progress }
   */
  processSealPointer(pointer) {
    if (!this.activeSeal || !pointer) return { hitWaypoint: false, completed: false, progress: 0 };

    const pts = this.activeSeal.pixelPoints;
    const target = pts[this.currentWaypointIndex];
    const dist = Math.hypot(pointer.x - target.x, pointer.y - target.y);

    if (dist <= this.sealTolerance) {
      this.currentWaypointIndex++;
      this.sealProgress = this.currentWaypointIndex / pts.length;

      if (this.currentWaypointIndex >= pts.length) {
        // Seal completed!
        this.heal(30);
        this.activeSeal = null;
        this.activeDirective = Math.random() > 0.5 ? PORTAL_DIRECTIVE.SLICE_CYAN : PORTAL_DIRECTIVE.SLICE_MAGENTA;
        this.directiveTimer = 0;
        return { hitWaypoint: true, completed: true, progress: 1.0 };
      }
      return { hitWaypoint: true, completed: false, progress: this.sealProgress };
    }

    return { hitWaypoint: false, completed: false, progress: this.sealProgress };
  }

  update(dt, difficulty = 1.0) {
    this.rotation += dt * (0.4 + (1 - this.stability / 100) * 0.8);
    this.pulsePhase += dt * 3;

    // Check seal timer if seal is active
    if (this.activeSeal) {
      this.sealTimer -= dt;
      if (this.sealTimer <= 0) {
        // Seal failed! Dimensional breach damage
        this.damage(25);
        this.activeSeal = null;
        this.activeDirective = Math.random() > 0.5 ? PORTAL_DIRECTIVE.SLICE_CYAN : PORTAL_DIRECTIVE.SLICE_MAGENTA;
        this.directiveTimer = 0;
        return { sealFailed: true };
      }
    } else {
      // Normal directive rotation
      this.directiveTimer += dt;
      if (this.directiveTimer >= this.directiveDuration) {
        this.directiveTimer = 0;
        // Occasionally trigger seal breach, or switch target orb directive
        if (Math.random() < 0.28) {
          this.triggerSealBreach();
        } else {
          this.activeDirective = this.activeDirective === PORTAL_DIRECTIVE.SLICE_CYAN 
            ? PORTAL_DIRECTIVE.SLICE_MAGENTA 
            : PORTAL_DIRECTIVE.SLICE_CYAN;
        }
      }
    }

    return {};
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.cx, this.cy);

    const pulse = Math.sin(this.pulsePhase) * 6;
    const radius = this.baseRadius + pulse;
    const stabRatio = this.stability / 100;

    // Outer glow color shifts from Cyan (healthy) -> Magenta -> Critical Crimson
    let primaryColor = '#00f0ff';
    let secondaryColor = '#9d00ff';
    if (stabRatio < 0.35) {
      primaryColor = '#ff0055';
      secondaryColor = '#ff9900';
    } else if (stabRatio < 0.65) {
      primaryColor = '#ff00a0';
      secondaryColor = '#00f0ff';
    }

    // 1. Singularity Core (Black hole / Event Horizon)
    const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    grad.addColorStop(0, '#04020a');
    grad.addColorStop(0.6, '#0f0a28');
    grad.addColorStop(0.85, secondaryColor);
    grad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. Rotating Cybernetic Glyphic Rings
    ctx.save();
    ctx.rotate(this.rotation);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 3;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 18;

    // Segmented ring
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const aStart = (i * Math.PI) / 4 + 0.08;
      const aEnd = aStart + Math.PI / 4 - 0.16;
      ctx.arc(0, 0, radius * 0.9, aStart, aEnd);
      ctx.stroke();
    }

    // Inner counter-rotating ring
    ctx.rotate(-this.rotation * 2.2);
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      const aStart = (i * Math.PI) / 3 + 0.1;
      const aEnd = aStart + Math.PI / 3 - 0.2;
      ctx.arc(0, 0, radius * 0.65, aStart, aEnd);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Central Kanji / Dimensional Rune
    ctx.font = `bold ${Math.floor(radius * 0.45)}px 'Orbitron', 'Noto Sans JP', sans-serif`;
    ctx.fillStyle = primaryColor;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 20;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const rune = this.activeSeal ? '封' : (stabRatio < 0.4 ? '危' : '門');
    ctx.fillText(rune, 0, 0);

    ctx.restore();

    // 4. Render Active Seal Blueprint if in Seal Breach Mode
    if (this.activeSeal) {
      this.renderSealBlueprint(ctx);
    }
  }

  renderSealBlueprint(ctx) {
    const pts = this.activeSeal.pixelPoints;
    if (!pts || pts.length < 2) return;

    ctx.save();

    // Draw full target blueprint skeleton (dim neon)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = 'rgba(255, 183, 0, 0.35)';
    ctx.lineWidth = 6;
    ctx.setLineDash([12, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw completed segments (bright solid gold-cyan)
    if (this.currentWaypointIndex > 0) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i <= this.currentWaypointIndex && i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 8;
      ctx.stroke();
    }

    // Render waypoint markers
    for (let i = 0; i < pts.length; i++) {
      const isTarget = i === this.currentWaypointIndex;
      const isDone = i < this.currentWaypointIndex;
      const pt = pts[i];

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isTarget ? 16 : 8, 0, Math.PI * 2);
      ctx.fillStyle = isDone ? '#00f0ff' : (isTarget ? '#ffb700' : 'rgba(255, 255, 255, 0.4)');
      ctx.shadowColor = isTarget ? '#ffb700' : '#00f0ff';
      ctx.shadowBlur = isTarget ? 25 : 8;
      ctx.fill();

      if (isTarget) {
        // Pulsing target reticle
        ctx.beginPath();
        const pulse = 22 + Math.sin(Date.now() * 0.01) * 6;
        ctx.arc(pt.x, pt.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffb700';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Seal Timer Bar above Portal
    const barWidth = 260;
    const barHeight = 8;
    const barX = this.cx - barWidth / 2;
    const barY = this.cy - this.baseRadius - 40;
    const timeRatio = Math.max(0, this.sealTimer / this.sealMaxTime);

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = timeRatio > 0.3 ? '#ffb700' : '#ff0055';
    ctx.fillRect(barX, barY, barWidth * timeRatio, barHeight);

    ctx.font = "bold 13px 'Orbitron', sans-serif";
    ctx.fillStyle = '#ffb700';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.activeSeal.name} - TRACE WITH FINGER!`, this.cx, barY - 10);

    ctx.restore();
  }
}

