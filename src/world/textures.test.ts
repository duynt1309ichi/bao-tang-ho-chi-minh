import { describe, expect, it } from 'vitest';
import { rng, tileNoise } from './textures';

describe('tileNoise', () => {
  const n = tileNoise(8, rng(1));

  it('lặp liền mạch: mép trái = mép phải, mép trên = mép dưới', () => {
    for (const t of [0, 0.13, 0.5, 0.77]) {
      expect(n(0, t)).toBeCloseTo(n(1 - 1e-9, t), 6);
      expect(n(t, 0)).toBeCloseTo(n(t, 1 - 1e-9), 6);
    }
  });

  it('giá trị trong [0, 1] và cùng hạt giống cho cùng kết quả', () => {
    for (let i = 0; i < 100; i++) {
      const v = n(i / 100, (i * 7) % 100 / 100);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
    expect(tileNoise(8, rng(1))(0.3, 0.6)).toBe(n(0.3, 0.6));
  });
});
