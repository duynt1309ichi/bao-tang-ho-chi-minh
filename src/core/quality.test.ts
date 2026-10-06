import { describe, expect, it } from 'vitest';
import { FpsMonitor, lower, pickInitial } from './quality';

describe('quality', () => {
  it('BR-S12: cảm ứng → Thấp, máy tính → Trung bình', () => {
    expect(pickInitial(true)).toBe('low');
    expect(pickInitial(false)).toBe('medium');
  });

  it('hạ một bậc, Thấp thì hết', () => {
    expect(lower('high')).toBe('medium');
    expect(lower('medium')).toBe('low');
    expect(lower('low')).toBeNull();
  });

  const run = (m: FpsMonitor, fps: number, seconds: number) => {
    let hit = false;
    for (let i = 0; i < fps * seconds; i++) hit = m.push(1 / fps) || hit;
    return hit;
  };

  it('FPS 18 trong 5 s → hạ; chưa đủ 5 s → chưa hạ', () => {
    const m = new FpsMonitor();
    expect(run(m, 18, 4.9)).toBe(false);
    expect(run(m, 18, 0.2)).toBe(true);
  });

  it('FPS 30 → không hạ; tụt ngắn rồi hồi → không hạ', () => {
    const m = new FpsMonitor();
    expect(run(m, 30, 10)).toBe(false);
    expect(run(m, 10, 1)).toBe(false); // 4 s × 30 + 1 s × 10 = 26 FPS trung bình
    expect(run(m, 60, 3)).toBe(false);
  });

  it('reset xóa cửa sổ: 3 s chậm + reset + 3 s chậm → chưa hạ', () => {
    const m = new FpsMonitor();
    run(m, 18, 3);
    m.reset();
    expect(run(m, 18, 3)).toBe(false);
  });
});
