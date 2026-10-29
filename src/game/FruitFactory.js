// FruitFactory.js - Procedural Canvas Fruit Models, Slicing Physics & Geometry

export const FRUIT_TYPE = {
  WATERMELON: 'WATERMELON',
  ORANGE: 'ORANGE',
  APPLE: 'APPLE',
  BANANA: 'BANANA',
  STRAWBERRY: 'STRAWBERRY',
  PINEAPPLE: 'PINEAPPLE',
  COCONUT: 'COCONUT',
  BOMB: 'BOMB'
};

export const FRUIT_CONFIGS = {
  [FRUIT_TYPE.WATERMELON]: {
    name: 'Semangka',
    radius: 42,
    points: 100,
    juiceColor: '#ff2a5f',
    splatColor: 'rgba(255, 42, 95, 0.65)',
    rindColor: '#1d8348',
    fleshColor: '#ff2a5f'
  },
  [FRUIT_TYPE.ORANGE]: {
    name: 'Jeruk',
    radius: 35,
    points: 100,
    juiceColor: '#ff8c00',
    splatColor: 'rgba(255, 140, 0, 0.65)',
    rindColor: '#ff8c00',
    fleshColor: '#ffa500'
  },
  [FRUIT_TYPE.APPLE]: {
    name: 'Apel',
    radius: 36,
    points: 100,
    juiceColor: '#ff3344',
    splatColor: 'rgba(255, 51, 68, 0.65)',
    rindColor: '#e71d36',
    fleshColor: '#fff8e7'
  },
  [FRUIT_TYPE.BANANA]: {
    name: 'Pisang',
    radius: 32,
    points: 120,
    juiceColor: '#ffe066',
    splatColor: 'rgba(255, 224, 102, 0.65)',
    rindColor: '#ffd166',
    fleshColor: '#fffdf0'
  },
  [FRUIT_TYPE.STRAWBERRY]: {
    name: 'Stroberi',
    radius: 28,
    points: 150,
    juiceColor: '#ff1493',
    splatColor: 'rgba(255, 20, 147, 0.65)',
    rindColor: '#e60067',
    fleshColor: '#ff69b4'
  },
  [FRUIT_TYPE.PINEAPPLE]: {
    name: 'Nanas',
    radius: 40,
    points: 150,
    juiceColor: '#ffd700',
    splatColor: 'rgba(255, 215, 0, 0.65)',
    rindColor: '#cc8800',
    fleshColor: '#ffe033'
  },
  [FRUIT_TYPE.COCONUT]: {
    name: 'Kelapa',
    radius: 38,
    points: 130,
    juiceColor: '#f8f9fa',
    splatColor: 'rgba(248, 249, 250, 0.7)',
    rindColor: '#5c3a21',
    fleshColor: '#ffffff'
  },
  [FRUIT_TYPE.BOMB]: {
    name: 'BOM',
    radius: 34,
    points: 0,
    juiceColor: '#ff4500',
    splatColor: 'rgba(50, 50, 50, 0.85)',
    rindColor: '#1e1e1e',
    fleshColor: '#ff3300'
  }
};

export class Fruit {
  constructor(type, x, y, vx, vy) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.type = type;
    this.config = FRUIT_CONFIGS[type];
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = this.config.radius;
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 4.5;
    this.isSliced = false;
    this.fuseTime = 0;
  }

  update(dt, gravity = 390) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += gravity * dt; // Floatier gentle gravity
    this.rotation += this.vRot * dt;

    if (this.type === FRUIT_TYPE.BOMB) {
      this.fuseTime += dt * 15;
    }
  }

  render(ctx) {
    if (this.isSliced) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    switch (this.type) {
      case FRUIT_TYPE.WATERMELON:
        this.renderWatermelon(ctx);
        break;
      case FRUIT_TYPE.ORANGE:
        this.renderOrange(ctx);
        break;
      case FRUIT_TYPE.APPLE:
        this.renderApple(ctx);
        break;
      case FRUIT_TYPE.BANANA:
        this.renderBanana(ctx);
        break;
      case FRUIT_TYPE.STRAWBERRY:
        this.renderStrawberry(ctx);
        break;
      case FRUIT_TYPE.PINEAPPLE:
        this.renderPineapple(ctx);
        break;
      case FRUIT_TYPE.COCONUT:
        this.renderCoconut(ctx);
        break;
      case FRUIT_TYPE.BOMB:
        this.renderBomb(ctx);
        break;
      default:
        this.renderGenericFruit(ctx);
    }

    ctx.restore();
  }

  renderWatermelon(ctx) {
    const r = this.radius;
    // Outer green sphere
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#228b22';
    ctx.fill();

    // Dark green vertical curved stripes
    ctx.strokeStyle = '#0f4d0f';
    ctx.lineWidth = 4;
    for (let i = -r * 0.7; i <= r * 0.7; i += r * 0.45) {
      ctx.beginPath();
      ctx.arc(i, 0, r, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }

    // Specular shine
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();
  }

  renderOrange(ctx) {
    const r = this.radius;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ff8c00';
    ctx.fill();

    // Stem dot & small green leaf
    ctx.beginPath();
    ctx.arc(0, -r + 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#4a7c20';
    ctx.fill();

    // Leaf
    ctx.beginPath();
    ctx.ellipse(6, -r + 1, 8, 4, Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = '#2e8b57';
    ctx.fill();

    // Highlights
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
  }

  renderApple(ctx) {
    const r = this.radius;
    // Apple round body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#e60026';
    ctx.fill();

    // Brown stem
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -r + 2);
    ctx.quadraticCurveTo(-2, -r - 8, -6, -r - 12);
    ctx.stroke();

    // Green leaf
    ctx.beginPath();
    ctx.ellipse(7, -r - 4, 7, 3, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fillStyle = '#32cd32';
    ctx.fill();

    // Specular highlight
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
  }

  renderBanana(ctx) {
    const r = this.radius;
    ctx.save();
    ctx.scale(1.4, 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.restore();

    // Banana ends
    ctx.beginPath();
    ctx.arc(-r * 1.2, 0, 4, 0, Math.PI * 2);
    ctx.arc(r * 1.2, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#6b4423';
    ctx.fill();
  }

  renderStrawberry(ctx) {
    const r = this.radius;
    // Strawberry conical berry
    ctx.beginPath();
    ctx.moveTo(0, r * 1.1);
    ctx.bezierCurveTo(-r * 1.1, r * 0.3, -r, -r * 0.6, 0, -r * 0.8);
    ctx.bezierCurveTo(r, -r * 0.6, r * 1.1, r * 0.3, 0, r * 1.1);
    ctx.fillStyle = '#e6005c';
    ctx.fill();

    // Yellow seed dots
    ctx.fillStyle = '#fff44f';
    const seeds = [[-8, -5], [0, -10], [8, -5], [-12, 6], [-4, 5], [6, 7], [0, 16]];
    seeds.forEach(([sx, sy]) => {
      ctx.fillRect(sx, sy, 2, 2.5);
    });

    // Leaf cap
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(-12, -r - 2);
    ctx.lineTo(-4, -r * 0.7);
    ctx.lineTo(0, -r - 5);
    ctx.lineTo(4, -r * 0.7);
    ctx.lineTo(12, -r - 2);
    ctx.closePath();
    ctx.fillStyle = '#228b22';
    ctx.fill();
  }

  renderPineapple(ctx) {
    const r = this.radius;
    // Oval body
    ctx.save();
    ctx.scale(0.85, 1.2);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#d48806';
    ctx.fill();

    // Cross hatch pattern
    ctx.strokeStyle = '#874d00';
    ctx.lineWidth = 2;
    for (let i = -r; i <= r; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, -r);
      ctx.lineTo(i + 20, r);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, r);
      ctx.lineTo(i + 20, -r);
      ctx.stroke();
    }
    ctx.restore();

    // Spiky crown
    ctx.fillStyle = '#2e7d32';
    for (let j = -2; j <= 2; j++) {
      ctx.beginPath();
      ctx.moveTo(j * 6, -r * 1.1);
      ctx.lineTo(j * 9, -r * 1.6);
      ctx.lineTo(j * 6 + 4, -r * 1.1);
      ctx.fill();
    }
  }

  renderCoconut(ctx) {
    const r = this.radius;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#4a2c11';
    ctx.fill();

    // 3 dark pores
    ctx.fillStyle = '#221105';
    ctx.beginPath();
    ctx.arc(-8, -6, 3, 0, Math.PI * 2);
    ctx.arc(8, -6, 3, 0, Math.PI * 2);
    ctx.arc(0, 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // Shell texture
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r - 3, i * 1.0, i * 1.0 + 0.4);
      ctx.stroke();
    }
  }

  renderBomb(ctx) {
    const r = this.radius;
    // Iron Bomb body
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1c1c1c';
    ctx.fill();
    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Metallic sheen
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.35, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill();

    // Bomb Cap
    ctx.fillStyle = '#4f4f4f';
    ctx.fillRect(-6, -r - 6, 12, 8);

    // Burning Wick
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -r - 6);
    ctx.quadraticCurveTo(8, -r - 14, 4, -r - 20);
    ctx.stroke();

    // Sparking Ember
    const sparkSize = 4 + Math.sin(this.fuseTime) * 2;
    ctx.beginPath();
    ctx.arc(4, -r - 20, sparkSize, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.4 ? '#ffcc00' : '#ff3300';
    ctx.shadowColor = '#ff5500';
    ctx.shadowBlur = 12;
    ctx.fill();

    // Red Danger Cross / Skull Icon
    ctx.strokeStyle = '#ff2a2a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(10, 10);
    ctx.moveTo(10, -10);
    ctx.lineTo(-10, 10);
    ctx.stroke();
  }

  renderGenericFruit(ctx) {
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.fleshColor;
    ctx.fill();
  }
}

/**
 * Cut Fruit Half Piece (Falls with realistic physics and rotation)
 */
export class FruitHalf {
  constructor(type, x, y, vx, vy, side = 'left', cutAngle = 0) {
    this.type = type;
    this.config = FRUIT_CONFIGS[type];
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.side = side; // 'left' or 'right'
    this.radius = this.config.radius;
    this.rotation = cutAngle;
    this.vRot = side === 'left' ? -3.5 - Math.random() * 2 : 3.5 + Math.random() * 2;
    this.life = 2.0; // 2 seconds before despawn
  }

  update(dt, gravity = 520) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += gravity * dt;
    this.rotation += this.vRot * dt;
    this.life -= dt;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const r = this.radius;

    // Draw Sliced Half
    ctx.beginPath();
    if (this.side === 'left') {
      ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5, false);
    } else {
      ctx.arc(0, 0, r, -Math.PI * 0.5, Math.PI * 0.5, false);
    }
    ctx.closePath();

    // Rind
    ctx.fillStyle = this.config.rindColor;
    ctx.fill();

    // Flesh Cross-section
    ctx.beginPath();
    if (this.side === 'left') {
      ctx.arc(0, 0, r * 0.85, Math.PI * 0.5, Math.PI * 1.5, false);
    } else {
      ctx.arc(0, 0, r * 0.85, -Math.PI * 0.5, Math.PI * 0.5, false);
    }
    ctx.closePath();
    ctx.fillStyle = this.config.fleshColor;
    ctx.fill();

    // Specific inside details for Watermelon seeds
    if (this.type === FRUIT_TYPE.WATERMELON) {
      ctx.fillStyle = '#0a0a0a';
      const dir = this.side === 'left' ? -1 : 1;
      ctx.fillRect(dir * r * 0.4, -r * 0.3, 3, 4);
      ctx.fillRect(dir * r * 0.5, 0, 3, 4);
      ctx.fillRect(dir * r * 0.35, r * 0.3, 3, 4);
    }

    ctx.restore();
  }
}

