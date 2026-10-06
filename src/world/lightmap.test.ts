import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { packLightmap } from './lightmap';

const box = (x: number, y: number, z: number, sx: number, sy: number, sz: number) => new THREE.BoxGeometry(sx, sy, sz).translate(x, y, z).toNonIndexed();

/** Hình chữ nhật texel của từng mặt (6 đỉnh) — null nếu dồn về một điểm. */
function rects(g: THREE.BufferGeometry, size: number) {
  const uv = g.getAttribute('uv1');
  const out: ([number, number, number, number] | null)[] = [];
  for (let f = 0; f < uv.count; f += 6) {
    const us = [0, 1, 2, 3, 4, 5].map((k) => uv.getX(f + k) * size);
    const vs = [0, 1, 2, 3, 4, 5].map((k) => uv.getY(f + k) * size);
    const r: [number, number, number, number] = [Math.min(...us), Math.min(...vs), Math.max(...us), Math.max(...vs)];
    out.push(r[2] - r[0] < 1e-6 ? null : r);
  }
  return out;
}

describe('packLightmap', () => {
  const size = 256;
  const a = box(0, 1, 0, 4, 2, 0.2);
  const b = box(0, 1, 0.2, 4, 2, 0.2); // áp lưng vào a
  const floor = new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2).toNonIndexed();
  const occluders = [a, b].map((g) => new THREE.Box3().setFromBufferAttribute(g.getAttribute('position') as THREE.BufferAttribute));
  const density = packLightmap([a, b, floor], occluders, [1, 1, 0.5], size);

  it('UV trong [0, 1] và các chart không chồng nhau', () => {
    const all = [a, b, floor].flatMap((g) => rects(g, size)).filter((r) => r !== null);
    for (const r of all) {
      expect(r[0]).toBeGreaterThanOrEqual(0);
      expect(r[3]).toBeLessThanOrEqual(size);
    }
    for (let i = 0; i < all.length; i++)
      for (let j = i + 1; j < all.length; j++) {
        const [p, q] = [all[i], all[j]];
        const overlap = p[0] < q[2] - 1e-6 && q[0] < p[2] - 1e-6 && p[1] < q[3] - 1e-6 && q[1] < p[3] - 1e-6;
        expect(overlap).toBe(false);
      }
  });

  it('mặt áp lưng và đáy chạm sàn dồn về một điểm; mặt lộ ra có chart đúng tỉ lệ', () => {
    // Thứ tự mặt BoxGeometry: +x, −x, +y, −y, +z, −z.
    const ra = rects(a, size), rb = rects(b, size);
    expect(ra[4]).toBeNull(); // mặt +z của a áp vào b
    expect(rb[5]).toBeNull(); // mặt −z của b áp vào a
    expect(ra[3]).toBeNull(); // đáy
    const front = ra[5]!;
    expect((front[2] - front[0]) / (front[3] - front[1])).toBeCloseTo(2, 1); // 4 m × 2 m
    const f = rects(floor, size)[0]!;
    expect(f[2] - f[0]).toBeCloseTo(6 * 0.5 * density, 3); // hệ số mật độ 0,5
  });
});
