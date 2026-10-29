// GestureRecognizer.js - Multi-tier Hand Pose & Gesture State Machine

export const GESTURE_STATE = {
  NONE: 'NONE',
  POINTING: 'POINTING',     // Energy Slash & Seal Drawing (Index tip extended)
  OPEN_PALM: 'OPEN_PALM',   // Energy Shield (All fingers spread out facing camera)
  FIST: 'FIST',             // Neutral closed fist
  UNKNOWN: 'UNKNOWN'
};

export const LM = {
  WRIST: 0,
  THUMB_CMC: 1, THUMB_MCP: 2, THUMB_IP: 3, THUMB_TIP: 4,
  INDEX_MCP: 5, INDEX_PIP: 6, INDEX_DIP: 7, INDEX_TIP: 8,
  MIDDLE_MCP: 9, MIDDLE_PIP: 10, MIDDLE_DIP: 11, MIDDLE_TIP: 12,
  RING_MCP: 13, RING_PIP: 14, RING_DIP: 15, RING_TIP: 16,
  PINKY_MCP: 17, PINKY_PIP: 18, PINKY_DIP: 19, PINKY_TIP: 20
};

export class GestureRecognizer {
  constructor() {
    this.currentState = GESTURE_STATE.NONE;
    this.confidence = 0;
    this.stateHoldFrames = 0;
    this.minHoldFramesToSwitch = 2; // Fast, responsive hysteresis
    this.pendingState = GESTURE_STATE.NONE;
  }

  dist2D(p1, p2) {
    if (!p1 || !p2) return 0;
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }

  /**
   * Evaluates if a finger is extended away from wrist relative to knuckle (MCP)
   */
  isFingerExtended(landmarks, tipIdx, mcpIdx) {
    const wrist = landmarks[LM.WRIST];
    const tip = landmarks[tipIdx];
    const mcp = landmarks[mcpIdx];
    return this.dist2D(tip, wrist) > this.dist2D(mcp, wrist) * 1.15;
  }

  /**
   * Evaluates if a finger is curled in towards wrist
   */
  isFingerCurled(landmarks, tipIdx, mcpIdx) {
    const wrist = landmarks[LM.WRIST];
    const tip = landmarks[tipIdx];
    const mcp = landmarks[mcpIdx];
    return this.dist2D(tip, wrist) < this.dist2D(mcp, wrist) * 1.12;
  }

  /**
   * Computes palm centroid (center of palm volume)
   */
  getPalmCenter(landmarks) {
    const wrist = landmarks[LM.WRIST];
    const idxMcp = landmarks[LM.INDEX_MCP];
    const midMcp = landmarks[LM.MIDDLE_MCP];
    const pnkMcp = landmarks[LM.PINKY_MCP];

    return {
      x: (wrist.x + idxMcp.x + midMcp.x + pnkMcp.x) / 4,
      y: (wrist.y + idxMcp.y + midMcp.y + pnkMcp.y) / 4,
      z: ((wrist.z || 0) + (idxMcp.z || 0) + (midMcp.z || 0) + (pnkMcp.z || 0)) / 4
    };
  }

  /**
   * Computes palm radius based on hand scale
   */
  getPalmRadius(landmarks) {
    const wrist = landmarks[LM.WRIST];
    const midMcp = landmarks[LM.MIDDLE_MCP];
    return Math.max(0.07, this.dist2D(wrist, midMcp) * 1.1);
  }

  /**
   * Analyze raw normalized landmarks and returns classified gesture info
   */
  recognize(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      this.currentState = GESTURE_STATE.NONE;
      return {
        state: GESTURE_STATE.NONE,
        pointer: null,
        shieldCenter: null,
        shieldRadius: 0.1,
        confidence: 0
      };
    }

    const indexExtended = this.isFingerExtended(landmarks, LM.INDEX_TIP, LM.INDEX_MCP);
    const middleExtended = this.isFingerExtended(landmarks, LM.MIDDLE_TIP, LM.MIDDLE_MCP);
    const ringExtended = this.isFingerExtended(landmarks, LM.RING_TIP, LM.RING_MCP);
    const pinkyExtended = this.isFingerExtended(landmarks, LM.PINKY_TIP, LM.PINKY_MCP);

    const middleCurled = this.isFingerCurled(landmarks, LM.MIDDLE_TIP, LM.MIDDLE_MCP);
    const ringCurled = this.isFingerCurled(landmarks, LM.RING_TIP, LM.RING_MCP);
    const pinkyCurled = this.isFingerCurled(landmarks, LM.PINKY_TIP, LM.PINKY_MCP);

    let rawDetectedState = GESTURE_STATE.UNKNOWN;
    let confidence = 0.6;

    // 1. OPEN PALM (Shield Mode) - All 4 main fingers extended
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      rawDetectedState = GESTURE_STATE.OPEN_PALM;
      confidence = 0.95;
    }
    // 2. POINTING (Energy Slash & Seal Draw) - Index extended while NOT all fingers are open
    else if (indexExtended && (middleCurled || ringCurled || pinkyCurled || !middleExtended)) {
      rawDetectedState = GESTURE_STATE.POINTING;
      confidence = 0.9;
    }
    // 3. FIST - All curled
    else if (!indexExtended && middleCurled && ringCurled) {
      rawDetectedState = GESTURE_STATE.FIST;
      confidence = 0.85;
    } else {
      // Default fallback when hand is in motion: treat as slashing pointer if index is near the front
      rawDetectedState = GESTURE_STATE.POINTING;
      confidence = 0.75;
    }

    // Debounce / State Machine Hysteresis filter
    if (rawDetectedState === this.pendingState) {
      this.stateHoldFrames++;
      if (this.stateHoldFrames >= this.minHoldFramesToSwitch) {
        this.currentState = rawDetectedState;
        this.confidence = confidence;
      }
    } else {
      this.pendingState = rawDetectedState;
      this.stateHoldFrames = 1;
    }

    // Derived interactive anchor points
    const pointer = landmarks[LM.INDEX_TIP];
    const palmCenter = this.getPalmCenter(landmarks);
    const palmRadius = this.getPalmRadius(landmarks);

    return {
      state: this.currentState,
      rawDetected: rawDetectedState,
      confidence: this.confidence,
      pointer: { x: pointer.x, y: pointer.y, z: pointer.z || 0 },
      shieldCenter: { x: palmCenter.x, y: palmCenter.y, z: palmCenter.z || 0 },
      shieldRadius: palmRadius
    };
  }
}
