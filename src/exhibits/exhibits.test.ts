import { describe, expect, it } from 'vitest';
import { quiz } from '../content/quiz';
import { shuffleOptions } from '../quiz/session';
import * as THREE from 'three';
import { pickTarget } from './proximity';
import { clampModelPitch, MODEL_PITCH_MAX, modelRotator } from './viewer';

describe('pickTarget (BR-S09)', () => {
  // Nhân vật ở gốc, nhìn theo +z (yaw = 0).
  const a = { id: 'a', x: 0, z: 1.5 };

  it('cách 1,5 m, mặt hướng về hiện vật → là mục tiêu; quay lưng → không', () => {
    expect(pickTarget(0, 0, 0, [a])).toBe(a);
    expect(pickTarget(0, 0, Math.PI, [a])).toBeNull();
  });

  it('cách 2,5 m → không', () => {
    expect(pickTarget(0, 0, 0, [{ id: 'far', x: 0, z: 2.5 }])).toBeNull();
  });

  it('lệch quá 60° → không; trong 60° → có', () => {
    expect(pickTarget(0, 0, 0, [{ id: 'side', x: 1.5, z: 0.5 }])).toBeNull(); // ~71°
    expect(pickTarget(0, 0, 0, [{ id: 'ok', x: 1, z: 1.2 }])?.id).toBe('ok'); // ~40°
  });

  it('nhiều cái thỏa → cái gần nhất', () => {
    expect(pickTarget(0, 0, 0, [a, { id: 'near', x: 0.3, z: 0.9 }])?.id).toBe('near');
  });
});

describe('shuffleOptions (FR-16)', () => {
  it('đáp án đúng vẫn trỏ tới đúng phương án sau khi xáo', () => {
    let seed = 7;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (const q of quiz) {
      const s = shuffleOptions(q, rng);
      expect([...s.options].sort()).toEqual([...q.options].sort());
      expect(s.options[s.answer]).toBe(q.options[q.answer]);
    }
  });
});

describe('xoay mô hình 🧊 (FR-13 2a)', () => {
  it('kẹp góc dọc trong ±30°', () => {
    expect(clampModelPitch(1)).toBeCloseTo(Math.PI / 6);
    expect(clampModelPitch(-1)).toBeCloseTo(-Math.PI / 6);
    expect(clampModelPitch(0.2)).toBe(0.2);
  });

  it('kéo lên hết dừng ở +30°; đặt lại góc về hướng ban đầu', () => {
    const mesh = new THREE.Object3D();
    mesh.rotation.y = 1;
    const start = mesh.quaternion.clone();
    const r = modelRotator(mesh);
    r.rotate(500, -10000);
    expect(r.pitch).toBeCloseTo(MODEL_PITCH_MAX);
    expect(mesh.quaternion.angleTo(start)).toBeGreaterThan(0.1);
    r.reset();
    expect(mesh.quaternion.angleTo(start)).toBeCloseTo(0);
  });
});
