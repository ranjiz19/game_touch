// storage.js - LocalStorage persistence for KIRU: Rift Guardian

const STORAGE_KEYS = {
  HIGH_SCORE: 'kiru_high_score',
  STATS: 'kiru_lifetime_stats',
  SETTINGS: 'kiru_settings',
  CALIBRATION: 'kiru_calibration'
};

const DEFAULT_SETTINGS = {
  soundEnabled: true,
  sfxVolume: 0.8,
  bgmVolume: 0.5,
  particleDensity: 'high', // 'low', 'medium', 'high'
  mirrorMode: true,
  sensitivity: 1.2,
  smoothing: 0.35,
  fruitSpeed: 1.0, // 0.7 = Santai/Slow, 1.0 = Normal Floaty, 1.3 = Cepat/Fast
  showWebcamPreview: true
};

const DEFAULT_CALIBRATION = {
  cropX: 0.05, // 5% border margin
  cropY: 0.05,
  minConfidence: 0.5
};

export function getHighScore() {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    console.warn('LocalStorage error reading high score:', e);
    return 0;
  }
}

export function saveHighScore(score) {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, score.toString());
      return true; // New record!
    }
    return false;
  } catch (e) {
    console.warn('LocalStorage error saving high score:', e);
    return false;
  }
}

export function getLifetimeStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    return raw ? JSON.parse(raw) : {
      gamesPlayed: 0,
      totalOrbsSliced: 0,
      totalSealsCompleted: 0,
      totalSurgesDeflected: 0,
      highestCombo: 0
    };
  } catch (e) {
    return {
      gamesPlayed: 0,
      totalOrbsSliced: 0,
      totalSealsCompleted: 0,
      totalSurgesDeflected: 0,
      highestCombo: 0
    };
  }
}

export function updateLifetimeStats(sessionStats) {
  try {
    const current = getLifetimeStats();
    current.gamesPlayed += 1;
    current.totalOrbsSliced += (sessionStats.orbsSliced || 0);
    current.totalSealsCompleted += (sessionStats.sealsCompleted || 0);
    current.totalSurgesDeflected += (sessionStats.surgesDeflected || 0);
    if ((sessionStats.maxCombo || 0) > current.highestCombo) {
      current.highestCombo = sessionStats.maxCombo;
    }
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(current));
  } catch (e) {
    console.warn('LocalStorage error updating lifetime stats:', e);
  }
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('LocalStorage error saving settings:', e);
  }
}

export function getCalibration() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CALIBRATION);
    if (!raw) return { ...DEFAULT_CALIBRATION };
    return { ...DEFAULT_CALIBRATION, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_CALIBRATION };
  }
}

export function saveCalibration(calibration) {
  try {
    localStorage.setItem(STORAGE_KEYS.CALIBRATION, JSON.stringify(calibration));
  } catch (e) {
    console.warn('LocalStorage error saving calibration:', e);
  }
}

