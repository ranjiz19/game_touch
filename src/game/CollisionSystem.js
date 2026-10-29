// CollisionSystem.js - Katana Blade Geometry Intersection & Cut Angle Physics

export class CollisionSystem {
  constructor() {
    this.minSlashSpeed = 40; // Responsif untuk ayunan tangan di webcam
  }

  /**
   * Distance between point (px, py) and segment (x1, y1)-(x2, y2)
   */
  distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = Math.hypot(x2 - x1, y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  /**
   * Checks if player's blade slices the fruit.
   * Tests the latest movement stroke, direct fingertip proximity, and recent trail points
   * so high-speed slashes and webcam frame skips are never missed.
   */
  checkBladeSlice(player, fruit) {
    if (!player || !fruit || fruit.isSliced) return null;
    if (!player.pointer) return null;

    const hitRadius = fruit.radius + 16;

    // 1. Check segment between prevPointer and pointer (most common)
    if (player.prevPointer) {
      const d = this.distToSegment(
        fruit.x, fruit.y,
        player.prevPointer.x, player.prevPointer.y,
        player.pointer.x, player.pointer.y
      );
      if (d <= hitRadius) {
        const angle = Math.atan2(
          player.pointer.y - player.prevPointer.y,
          player.pointer.x - player.prevPointer.x
        );
        return {
          hit: true,
          cutAngle: angle,
          perpAngle: angle + Math.PI / 2
        };
      }
    }

    // 2. Direct fingertip touch with minimal movement
    const tipDist = Math.hypot(fruit.x - player.pointer.x, fruit.y - player.pointer.y);
    if (tipDist <= hitRadius && player.velocity >= this.minSlashSpeed) {
      const angle = player.prevPointer
        ? Math.atan2(player.pointer.y - player.prevPointer.y, player.pointer.x - player.prevPointer.x)
        : -Math.PI / 4;
      return {
        hit: true,
        cutAngle: angle,
        perpAngle: angle + Math.PI / 2
      };
    }

    // 3. Check recent trail segments (last 4 points) to catch fast cuts
    const trail = player.trail;
    if (trail && trail.length >= 2) {
      const checkCount = Math.min(4, trail.length - 1);
      for (let i = 0; i < checkCount; i++) {
        const pA = trail[i];
        const pB = trail[i + 1];
        const d = this.distToSegment(fruit.x, fruit.y, pA.x, pA.y, pB.x, pB.y);
        if (d <= hitRadius) {
          const angle = Math.atan2(pA.y - pB.y, pA.x - pB.x);
          return {
            hit: true,
            cutAngle: angle,
            perpAngle: angle + Math.PI / 2
          };
        }
      }
    }

    return null;
  }

  /**
   * Legacy single-segment check
   */
  checkSlice(p1, p2, fruit, speed) {
    if (!p1 || !p2 || !fruit || fruit.isSliced) return null;
    if (speed < this.minSlashSpeed) return null;

    const d = this.distToSegment(fruit.x, fruit.y, p1.x, p1.y, p2.x, p2.y);
    if (d <= fruit.radius + 14) {
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      return {
        hit: true,
        cutAngle: angle,
        perpAngle: angle + Math.PI / 2
      };
    }
    return null;
  }
}
