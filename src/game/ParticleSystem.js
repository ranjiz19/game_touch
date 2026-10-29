// ParticleSystem.js - Juicy Fruit Splatters, Droplets & Fruit Ninja VFX

class JuiceParticle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.radius = 3;
    this.color = '#ff2a5f';
    this.alpha = 1.0;
    this.life = 0;
    this.maxLife = 0.8;
  }

  init(x, y, vx, vy, color, radius, maxLife) {
    this.active = true;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.radius = radius;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.alpha = 1.0;
  }

  update(dt, gravity = 600) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += gravity * dt;
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  render(ctx) {
    if (!this.active || this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class WallSplat {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.alpha = 0.75;
    this.life = 12.0; // Stays on wall for 12 seconds
    this.maxLife = 12.0;
    // Pre-calculate random droplets around center
    this.droplets = [];
    const count = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.6 + Math.random() * 0.9);
      this.droplets.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        r: 3 + Math.random() * 4
      });
    }
  }

  update(dt) {
    this.life -= dt;
    this.alpha = Math.max(0, (this.life / this.maxLife) * 0.75);
  }

  render(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;

    // Main blob
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Satellite splatter droplets
    for (const d of this.droplets) {
      ctx.beginPath();
      ctx.arc(this.x + d.dx, this.y + d.dy, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class FloatingScore {
  constructor() {
    this.active = false;
    this.text = '';
    this.x = 0;
    this.y = 0;
    this.vy = -70;
    this.color = '#ffffff';
    this.alpha = 1.0;
    this.life = 0.9;
    this.maxLife = 0.9;
    this.scale = 1.2;
  }

  init(text, x, y, color = '#ffd700') {
    this.active = true;
    this.text = text;
    this.x = x;
    this.y = y;
    this.vy = -80;
    this.color = color;
    this.life = 0.9;
    this.maxLife = 0.9;
    this.scale = 1.4;
  }

  update(dt) {
    if (!this.active) return;
    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }
    this.y += this.vy * dt;
    this.scale = Math.max(1.0, this.scale - dt * 1.5);
    this.alpha = Math.max(0, this.life / this.maxLife);
  }

  render(ctx) {
    if (!this.active || this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `900 ${Math.floor(26 * this.scale)}px 'Orbitron', 'Segoe UI', sans-serif`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor(maxParticles = 300) {
    this.maxParticles = maxParticles;
    this.pool = [];
    this.splats = [];
    this.scores = [];

    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push(new JuiceParticle());
    }
    for (let i = 0; i < 20; i++) {
      this.scores.push(new FloatingScore());
    }
  }

  spawnFruitJuice(x, y, color, splatColor) {
    // 1. Add wall splatter (limit max 20 splats)
    if (this.splats.length > 20) {
      this.splats.shift();
    }
    this.splats.push(new WallSplat(x, y, 22 + Math.random() * 12, splatColor));

    // 2. Burst 24 juicy droplets
    for (let i = 0; i < 24; i++) {
      const p = this.pool.find(item => !item.active);
      if (!p) break;

      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 260;
      p.init(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 100, // biased slightly upwards
        color,
        2.5 + Math.random() * 3.5,
        0.5 + Math.random() * 0.4
      );
    }
  }

  spawnBombExplosion(x, y) {
    // Flash splat
    this.splats.push(new WallSplat(x, y, 45, 'rgba(30, 30, 30, 0.8)'));

    // Shrapnel & sparks
    for (let i = 0; i < 45; i++) {
      const p = this.pool.find(item => !item.active);
      if (!p) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 200 + Math.random() * 450;
      const color = Math.random() > 0.3 ? '#ff3300' : '#ffcc00';
      p.init(
        x,
        y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        3 + Math.random() * 4,
        0.6 + Math.random() * 0.4
      );
    }
  }

  spawnScore(text, x, y, color = '#ffd700') {
    const s = this.scores.find(item => !item.active);
    if (s) {
      s.init(text, x, y, color);
    }
  }

  update(dt) {
    for (const p of this.pool) {
      if (p.active) p.update(dt);
    }
    for (let i = this.splats.length - 1; i >= 0; i--) {
      this.splats[i].update(dt);
      if (this.splats[i].life <= 0) {
        this.splats.splice(i, 1);
      }
    }
    for (const s of this.scores) {
      if (s.active) s.update(dt);
    }
  }

  renderSplats(ctx) {
    for (const splat of this.splats) {
      splat.render(ctx);
    }
  }

  renderParticles(ctx) {
    for (const p of this.pool) {
      if (p.active) p.render(ctx);
    }
    for (const s of this.scores) {
      if (s.active) s.render(ctx);
    }
  }

  clear() {
    this.pool.forEach(p => p.active = false);
    this.splats = [];
    this.scores.forEach(s => s.active = false);
  }
}
