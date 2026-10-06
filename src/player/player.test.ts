import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { describe, expect, it } from 'vitest';
import { clampPitch } from './camera';
import { resolveCapsule } from './collision';
import { normalizeMove } from './input';
import { stickVector } from './touch';

describe('normalizeMove (FR-04)', () => {
  it('đi chéo có tốc độ bằng đi thẳng', () => {
    const m = normalizeMove(new Set(['KeyW', 'KeyD']));
    expect(Math.hypot(m.right, m.forward)).toBeCloseTo(1);
  });
  it('hai phím ngược nhau thì đứng yên', () => {
    expect(normalizeMove(new Set(['KeyW', 'ArrowDown']))).toEqual({ right: 0, forward: 0 });
  });
});

describe('clampPitch (FR-05)', () => {
  it('kẹp trong ±60°', () => {
    expect(clampPitch(2)).toBeCloseTo(Math.PI / 3);
    expect(clampPitch(-2)).toBeCloseTo(-Math.PI / 3);
    expect(clampPitch(0.3)).toBe(0.3);
  });
});

describe('resolveCapsule (FR-07)', () => {
  // Tường dày 0,2 m, mặt trước tại z = -0.1.
  const bvh = new MeshBVH(new THREE.BoxGeometry(10, 3, 0.2).translate(0, 1.5, -0.2));

  it('đẩy nhân vật ra khỏi tường đúng bằng bán kính', () => {
    const feet = new THREE.Vector3(0, 0, -0.05);
    resolveCapsule(feet, bvh);
    expect(feet.z).toBeCloseTo(0.2, 2);
  });

  it('không đụng tường thì giữ nguyên', () => {
    const feet = new THREE.Vector3(0, 0, 1);
    resolveCapsule(feet, bvh);
    expect(feet.z).toBe(1);
  });

  it('bước dài liên tục vào tường không xuyên qua', () => {
    const feet = new THREE.Vector3(0, 0, 2);
    for (let i = 0; i < 300; i++) {
      feet.z -= 4.5 / 60;
      resolveCapsule(feet, bvh);
    }
    expect(feet.z).toBeGreaterThan(0.19);
  });
});

describe('stickVector (FR-06)', () => {
  it('kéo lên = đi tới, không chạy khi ≤ 60% bán kính', () => {
    const s = stickVector(0, -30, 56);
    expect(s.move.forward).toBeCloseTo(1);
    expect(s.run).toBe(false);
  });
  it('kéo quá 60% bán kính thì chạy; ra ngoài đế vẫn chỉ là hướng đơn vị', () => {
    const s = stickVector(200, 0, 56);
    expect(s.move.right).toBeCloseTo(1);
    expect(s.run).toBe(true);
  });
  it('chạm gần tâm thì đứng yên', () => {
    expect(stickVector(3, 2, 56).move).toEqual({ right: 0, forward: 0 });
  });
});
