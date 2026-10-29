// coordinateMapper.js - Camera to Canvas spatial transformation & smoothing with Aspect-Cover Fit

/**
 * Maps normalized camera coordinates [0..1] to Canvas coordinates [0..width, 0..height]
 * using Aspect-Ratio Cover (Center Crop) matching the video rendering, with mirror mode and smoothing.
 */
export class CoordinateMapper {
  constructor(options = {}) {
    this.canvasWidth = options.canvasWidth || 1920;
    this.canvasHeight = options.canvasHeight || 1080;
    this.videoWidth = options.videoWidth || 1280;
    this.videoHeight = options.videoHeight || 720;
    this.mirror = options.mirror !== undefined ? options.mirror : true;
    this.sensitivity = options.sensitivity || 1.18;
    this.cropX = options.cropX || 0.03; // 3% margin
    this.cropY = options.cropY || 0.03;
    this.smoothingFactor = options.smoothingFactor || 0.35; // 0 = instant, 0.9 = heavy lag

    this.smoothedPoints = new Map(); // Keyed smoothing per player/hand
  }

  setDimensions(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  setVideoDimensions(width, height) {
    if (width > 0 && height > 0) {
      this.videoWidth = width;
      this.videoHeight = height;
    }
  }

  updateConfig(config = {}) {
    if (config.mirror !== undefined) this.mirror = config.mirror;
    if (config.sensitivity !== undefined) this.sensitivity = config.sensitivity;
    if (config.cropX !== undefined) this.cropX = config.cropX;
    if (config.cropY !== undefined) this.cropY = config.cropY;
    if (config.smoothingFactor !== undefined) this.smoothingFactor = config.smoothingFactor;
  }

  /**
   * Transforms a normalized landmark point {x, y, z} into screen pixel coords {x, y, z}
   * @param {Object} rawPoint - {x: 0..1, y: 0..1, z}
   * @param {String|Boolean} smoothKey - optional key ('p1', 'p2', etc) for independent smoothing
   * @returns {Object} Canvas pixel coordinates {x, y, z}
   */
  mapPoint(rawPoint, smoothKey = false) {
    if (!rawPoint) return null;

    const cw = this.canvasWidth;
    const ch = this.canvasHeight;
    const vw = this.videoWidth;
    const vh = this.videoHeight;

    const canvasAspect = cw / ch;
    const videoAspect = vw / vh;

    // Aspect-Ratio Cover calculation (identical to drawImage cover)
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

    // Convert raw landmark to cropped viewport ratio [0..1]
    const px = rawPoint.x * vw;
    const py = rawPoint.y * vh;

    let nx = (px - sx) / sWidth;
    let ny = (py - sy) / sHeight;

    // 1. Mirror transformation
    if (this.mirror) {
      nx = 1.0 - nx;
    }

    // 2. Crop margin normalization
    const spanX = 1.0 - 2 * this.cropX;
    const spanY = 1.0 - 2 * this.cropY;
    if (spanX > 0.1 && spanY > 0.1) {
      nx = (nx - this.cropX) / spanX;
      ny = (ny - this.cropY) / spanY;
    }

    // 3. Sensitivity scale from center
    nx = 0.5 + (nx - 0.5) * this.sensitivity;
    ny = 0.5 + (ny - 0.5) * this.sensitivity;

    // Clamp to canvas bounds
    nx = Math.max(0, Math.min(1, nx));
    ny = Math.max(0, Math.min(1, ny));

    const targetX = nx * cw;
    const targetY = ny * ch;
    const targetZ = rawPoint.z || 0;

    // Optional Keyed EMA smoothing
    if (typeof smoothKey === 'string') {
      const last = this.smoothedPoints.get(smoothKey);
      if (last) {
        const alpha = 1.0 - this.smoothingFactor;
        const smoothX = last.x + (targetX - last.x) * alpha;
        const smoothY = last.y + (targetY - last.y) * alpha;
        const result = { x: smoothX, y: smoothY, z: targetZ };
        this.smoothedPoints.set(smoothKey, result);
        return result;
      }
      const initial = { x: targetX, y: targetY, z: targetZ };
      this.smoothedPoints.set(smoothKey, initial);
      return initial;
    }

    return { x: targetX, y: targetY, z: targetZ };
  }

  resetSmoothing(key = null) {
    if (key) {
      this.smoothedPoints.delete(key);
    } else {
      this.smoothedPoints.clear();
    }
  }
}
