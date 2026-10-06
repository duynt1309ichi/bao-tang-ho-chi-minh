// Mức chất lượng đồ họa (SRS FR-22 BR-S12, HLD 7.3). File này thuần để test; phần áp vào renderer ở `graphics.ts`.

export type Quality = 'low' | 'medium' | 'high';
export const QUALITIES: readonly Quality[] = ['low', 'medium', 'high'];
export const QUALITY_LABEL: Record<Quality, string> = { low: 'Thấp', medium: 'Trung bình', high: 'Cao' };

/** HLD 7.3. Lightmap bake dùng ở mọi mức. */
export const PRESETS: Record<Quality, { pixelRatio: number; texture: '1k' | '2k'; shadowMap: number; spotShadow: boolean; post: boolean; ao: boolean; vignette: boolean; fireworks: number }> = {
  low: { pixelRatio: 1, texture: '1k', shadowMap: 0, spotShadow: false, post: false, ao: false, vignette: false, fireworks: 0.25 },
  medium: { pixelRatio: 1.5, texture: '1k', shadowMap: 1024, spotShadow: false, post: true, ao: false, vignette: false, fireworks: 0.6 },
  high: { pixelRatio: 2, texture: '2k', shadowMap: 2048, spotShadow: true, post: true, ao: true, vignette: true, fireworks: 1 },
};

/** BR-S12: cảm ứng → Thấp, còn lại → Trung bình; Cao chỉ khi người dùng chọn. Hàm thuần. */
export function pickInitial(isTouch: boolean): Quality {
  return isTouch ? 'low' : 'medium';
}

/** Bậc thấp hơn một bậc; đã Thấp thì null. Hàm thuần. */
export function lower(q: Quality): Quality | null {
  return QUALITIES[QUALITIES.indexOf(q) - 1] ?? null;
}

const WINDOW_S = 5;
const MIN_FPS = 25;

/**
 * Đo FPS trong cửa sổ trượt 5 s (BR-S12). `push(dt)` trả về true khi cả 5 s gần nhất
 * có FPS trung bình < 25. Nơi gọi `reset()` khi không ở trạng thái chơi (đang tải, mở bảng),
 * để chỉ tính 5 s chơi liên tục. Hàm thuần (không đọc đồng hồ).
 */
export class FpsMonitor {
  private frames: number[] = [];
  private sum = 0;

  push(dt: number): boolean {
    this.frames.push(dt);
    this.sum += dt;
    while (this.frames.length && this.sum - this.frames[0] >= WINDOW_S) this.sum -= this.frames.shift()!;
    return this.sum >= WINDOW_S - 1e-9 && this.frames.length / this.sum < MIN_FPS;
  }

  reset() {
    this.frames = [];
    this.sum = 0;
  }
}
