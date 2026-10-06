import * as THREE from 'three';

// Texture vẽ thủ tục lúc chạy (vữa, gỗ sồi, đá, cỏ, thảm) — không tải file ảnh, không cần ghi credits.
// ponytail: chỉ có map màu; thêm normal/roughness map hoặc thay texture CC0 (ambientCG) nếu ảnh chụp còn phẳng.

/** RNG có hạt giống (mulberry32) để texture giống nhau mỗi lần tải. Hàm thuần. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Nhiễu giá trị lặp liền mạch: lưới `cells × cells` giá trị ngẫu nhiên, nội suy mượt.
 * Trả về hàm (u, v) ∈ [0, 1] → [0, 1]; u = 0 và u = 1 cho cùng giá trị nên texture lát không lộ mép. Hàm thuần.
 */
export function tileNoise(cells: number, rand: () => number) {
  const g = Float32Array.from({ length: cells * cells }, rand);
  return (u: number, v: number) => {
    const x = u * cells, y = v * cells;
    const i = Math.floor(x), j = Math.floor(y);
    let fx = x - i, fy = y - j;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    const i0 = i % cells, i1 = (i + 1) % cells;
    const r0 = (j % cells) * cells, r1 = ((j + 1) % cells) * cells;
    const a = g[r0 + i0] + (g[r0 + i1] - g[r0 + i0]) * fx;
    const b = g[r1 + i0] + (g[r1 + i1] - g[r1 + i0]) * fx;
    return a + (b - a) * fy;
  };
}

/** Tổng nhiều tầng nhiễu (fbm), kết quả ~[0, 1]. */
function fbm(rand: () => number, base: number, octaves: number) {
  const layers = Array.from({ length: octaves }, (_, k) => tileNoise(base << k, rand));
  return (u: number, v: number) => {
    let sum = 0, amp = 0.5, norm = 0;
    for (const n of layers) {
      sum += n(u, v) * amp;
      norm += amp;
      amp *= 0.5;
    }
    return sum / norm;
  };
}

type Painter = (u: number, v: number) => [number, number, number];

function paint(size: number, fn: Painter) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  for (let y = 0, p = 0; y < size; y++) {
    for (let x = 0; x < size; x++, p += 4) {
      const [r, g, b] = fn(x / size, y / size);
      img.data[p] = r;
      img.data[p + 1] = g;
      img.data[p + 2] = b;
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

const hex = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
};
const shade = (c: readonly [number, number, number], k: number): [number, number, number] => [c[0] * k, c[1] * k, c[2] * k];

/** Tường vữa nhám màu ngà #E9E3D6 (design.md mục 2). */
function plaster(size: number) {
  const n = fbm(rng(1), 4, 5);
  const grain = tileNoise(256, rng(2));
  const base = hex('#e9e3d6');
  return paint(size, (u, v) => shade(base, 0.95 + 0.06 * n(u, v) + 0.03 * (grain(u, v) - 0.5)));
}

/** Sàn gỗ sồi: 8 tấm/ô, mỗi tấm 2 đoạn so le, vân gỗ chạy dọc tấm. */
function oak(size: number) {
  const r = rng(3);
  const PLANKS = 8;
  const tone = Array.from({ length: PLANKS * 2 }, () => 0.82 + 0.22 * r());
  const offset = Array.from({ length: PLANKS }, () => r());
  const warp = fbm(rng(4), 4, 3);
  const fine = tileNoise(128, rng(5));
  const base = hex('#b48a5c');
  return paint(size, (u, v) => {
    const p = Math.floor(u * PLANKS);
    const across = u * PLANKS - p;
    const along = (v + offset[p]) % 1;
    const seg = along < 0.5 ? 0 : 1;
    const ring = Math.sin((across * 9 + warp(u, v) * 6) * Math.PI * 2) * 0.5 + 0.5;
    let k = tone[p * 2 + seg] * (0.9 + 0.12 * ring ** 3) * (0.96 + 0.08 * fine(u * 0.25, v));
    const seam = Math.min(across, 1 - across) < 0.012 || Math.abs(along - 0.5) < 0.003 || along < 0.003;
    if (seam) k *= 0.55;
    return shade(base, k);
  });
}

/** Sàn đá sáng: 2 × 2 phiến mỗi ô, đốm vân và mạch vữa. */
function stone(size: number) {
  const r = rng(6);
  const tone = Array.from({ length: 4 }, () => 0.93 + 0.08 * r());
  const n = fbm(rng(7), 8, 4);
  const vein = fbm(rng(8), 4, 4);
  const base = hex('#ddd6c8');
  return paint(size, (u, v) => {
    const i = Math.floor(u * 2), j = Math.floor(v * 2);
    const fu = u * 2 - i, fv = v * 2 - j;
    if (Math.min(fu, 1 - fu, fv, 1 - fv) < 0.006) return shade(base, 0.7);
    const veinK = 1 - 0.05 * Math.max(0, 1 - Math.abs(vein(u, v) - 0.5) / 0.02); // vân mờ, không thành vết nứt
    return shade(base, tone[j * 2 + i] * (0.94 + 0.1 * n(u, v)) * veinK);
  });
}

function grass(size: number) {
  const n = fbm(rng(9), 4, 4);
  const blades = tileNoise(512, rng(10));
  const base = hex('#5f7d45');
  return paint(size, (u, v) => {
    const k = 0.8 + 0.35 * n(u, v) + 0.25 * (blades(u, v) - 0.5);
    const c = shade(base, k);
    c[0] += 20 * (n(v, u) - 0.5);
    return c;
  });
}

/** Thảm: sợi dệt xám sáng, nhân với màu khu ở vật liệu. */
function carpet(size: number) {
  const fine = tileNoise(512, rng(11));
  const n = fbm(rng(12), 4, 3);
  return paint(size, (u, v) => {
    const weave = Math.sin(u * size * Math.PI * 0.5) * Math.sin(v * size * Math.PI * 0.5);
    const k = 0.86 + 0.06 * weave + 0.1 * fine(u, v) + 0.06 * n(u, v);
    return [255 * k, 255 * k, 255 * k];
  });
}

/** Kích thước một ô texture ngoài thế giới (mét) — UV của blockout tính theo mét. */
export const TILE_M = { plaster: 3, oak: 2, stone: 1.6, grass: 4, carpet: 1.5 } as const;
export type TextureName = keyof typeof TILE_M;

const PAINTERS: Record<TextureName, (size: number) => HTMLCanvasElement> = { plaster, oak, stone, grass, carpet };

export function makeTexture(name: TextureName, size: number) {
  const t = new THREE.CanvasTexture(PAINTERS[name](size));
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  t.repeat.setScalar(1 / TILE_M[name]);
  return t;
}

/** Vẽ lại texture ở kích thước khác khi đổi mức chất lượng (HLD 7.3). */
export function repaint(t: THREE.CanvasTexture, name: TextureName, size: number) {
  if (t.image.width === size) return;
  t.image = PAINTERS[name](size);
  t.needsUpdate = true;
}
