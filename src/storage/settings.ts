import { QUALITIES, pickInitial, type Quality } from '../core/quality';
import { kv } from './kv';

export const SETTINGS_KEY = 'bttr.settings.v1';

/** LLD mục 1.4 — âm lượng, ngày/đêm thêm cùng âm thanh (M4). */
export interface Settings {
  version: 1;
  quality: Quality;
  qualityManual: boolean;
  /** [0,1; 3,0], 1 chữ số thập phân. */
  sensitivity: number;
  invertY: boolean;
}

/** Kẹp độ nhạy về [0,1; 3,0] và làm tròn 0,1 (LLD 1.4). Hàm thuần. */
export const clampSensitivity = (v: number) => Math.round(Math.min(3, Math.max(0.1, v)) * 10) / 10;

/** Đọc settings; trường sai kiểu → mặc định riêng trường đó, sai version/JSON → toàn bộ mặc định (LLD 1.4). Hàm thuần. */
export function parseSettings(raw: string | null, isTouch: boolean): Settings {
  const def: Settings = { version: 1, quality: pickInitial(isTouch), qualityManual: false, sensitivity: 1, invertY: false };
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
    sensitivity: typeof data.sensitivity === 'number' && Number.isFinite(data.sensitivity) ? clampSensitivity(data.sensitivity) : def.sensitivity,
    invertY: typeof data.invertY === 'boolean' ? data.invertY : def.invertY,
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
