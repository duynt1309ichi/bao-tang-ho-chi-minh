import { QUALITIES, pickInitial, type Quality } from '../core/quality';
import { kv } from './kv';

export const SETTINGS_KEY = 'bttr.settings.v1';

/** LLD mục 1.4 */
export interface Settings {
  version: 1;
  quality: Quality;
  qualityManual: boolean;
  /** [0,1; 3,0], 1 chữ số thập phân. */
  sensitivity: number;
  invertY: boolean;
  /** Số nguyên [0; 100], bội của 5. */
  volumeMusic: number;
  volumeSfx: number;
  muted: boolean;
  night: boolean;
}

/** Kẹp âm lượng về [0; 100] và làm tròn tới bội 5 (LLD 1.4). Hàm thuần. */
export const clampVolume = (v: number) => Math.round(Math.min(100, Math.max(0, v)) / 5) * 5;

/** Kẹp độ nhạy về [0,1; 3,0] và làm tròn 0,1 (LLD 1.4). Hàm thuần. */
export const clampSensitivity = (v: number) => Math.round(Math.min(3, Math.max(0.1, v)) * 10) / 10;

/** Đọc settings; trường sai kiểu → mặc định riêng trường đó, sai version/JSON → toàn bộ mặc định (LLD 1.4). Hàm thuần. */
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function parseSettings(raw: string | null, isTouch: boolean): Settings {
  const def: Settings = { version: 1, quality: pickInitial(isTouch), qualityManual: false, sensitivity: 1, invertY: false, volumeMusic: 60, volumeSfx: 80, muted: false, night: false };
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw ?? 'null');
  } catch {
    return def;
  }
  if (typeof data !== 'object' || data === null || data.version !== 1) return def;
  return {
    version: 1,
    quality: QUALITIES.includes(data.quality as Quality) ? (data.quality as Quality) : def.quality,
    qualityManual: typeof data.qualityManual === 'boolean' ? data.qualityManual : def.qualityManual,
    sensitivity: num(data.sensitivity) ? clampSensitivity(data.sensitivity) : def.sensitivity,
    invertY: typeof data.invertY === 'boolean' ? data.invertY : def.invertY,
    volumeMusic: num(data.volumeMusic) ? clampVolume(data.volumeMusic) : def.volumeMusic,
    volumeSfx: num(data.volumeSfx) ? clampVolume(data.volumeSfx) : def.volumeSfx,
    muted: typeof data.muted === 'boolean' ? data.muted : def.muted,
    night: typeof data.night === 'boolean' ? data.night : def.night,
  };
}

export class SettingsStore {
  constructor(public value: Settings) {}

  static load(isTouch: boolean) {
    return new SettingsStore(parseSettings(kv.get(SETTINGS_KEY), isTouch));
  }

  update(patch: Partial<Omit<Settings, 'version'>>) {
    Object.assign(this.value, patch);
    kv.set(SETTINGS_KEY, JSON.stringify(this.value));
  }
}
