import * as THREE from 'three';

// UV lightmap (kênh uv1) cho hình học hộp / mặt phẳng của bảo tàng. Chạy giống hệt ở script xuất cảnh
// cho Blender bake (scripts/export-bake.ts) và ở runtime, nên ảnh lightmap khớp từng texel. Hàm thuần.

export const LIGHTMAP_SIZE = 2048;
const PAD = 2; // texel đệm mỗi phía chart; Blender bake margin = PAD

interface Quad {
  geo: number;
  first: number; // chỉ số đỉnh đầu (6 đỉnh = 2 tam giác)
  a: [number, number]; // trục chiếu
  min: [number, number];
  w: number; // mét × hệ số mật độ của nhóm
  h: number;
  k: number;
  hidden: boolean;
}

/**
 * Gán `uv1` cho các hình học không chỉ mục, mỗi 6 đỉnh liên tiếp là một mặt chữ nhật (Box/PlaneGeometry
 * đã `toNonIndexed()`). Mỗi mặt là một chart riêng, xếp kệ (shelf) vào atlas `size`², mật độ texel/m
 * tự giảm tới khi vừa. Mặt khuất dồn về một điểm, không tốn chỗ: đáy chạm sàn, đỉnh tường sát trần,
 * và mặt áp vào một khối đặc khác (`occluders`, ví dụ hai bức tường áp lưng, mặt sau ốp chân tường).
 * `scales[i]`: hệ số mật độ cho nhóm i (bề mặt ít chi tiết sáng như cỏ, trần dùng < 1). Trả về mật độ texel/m gốc.
 */
export function packLightmap(geos: THREE.BufferGeometry[], occluders: THREE.Box3[] = [], scales: number[] = [], size = LIGHTMAP_SIZE): number {
  const probe = new THREE.Vector3();
  /** Mặt bị che khi tâm và 4 góc (lùi 10 % vào trong), nhích ra 1 cm theo pháp tuyến, đều nằm trong khối đặc. */
  const covered = (p: ArrayLike<number>, first: number, c: [number, number, number], n: [number, number, number]) => {
    const pts = [c];
    for (let k = first; k < first + 6; k++) pts.push([0, 1, 2].map((i) => p[k * 3 + i] * 0.9 + c[i] * 0.1) as [number, number, number]);
    return pts.every((q) => {
      probe.set(q[0] + n[0] * 0.01, q[1] + n[1] * 0.01, q[2] + n[2] * 0.01);
      return occluders.some((b) => b.containsPoint(probe));
    });
  };
  const quads: Quad[] = [];
  geos.forEach((g, gi) => {
    const p = g.getAttribute('position').array as ArrayLike<number>;
    const n = g.getAttribute('normal').array as ArrayLike<number>;
    const count = g.getAttribute('position').count;
    if (count % 6) throw new Error('lightmap: hình học phải gồm các mặt 2 tam giác');
    for (let first = 0; first < count; first += 6) {
      const sx = n[first * 3], ny = n[first * 3 + 1], sz = n[first * 3 + 2];
      const nx = Math.abs(sx), nz = Math.abs(sz);
      const a: [number, number] = Math.abs(ny) >= nx && Math.abs(ny) >= nz ? [0, 2] : nx >= nz ? [2, 1] : [0, 1];
      let u0 = Infinity, v0 = Infinity, u1 = -Infinity, v1 = -Infinity, cx = 0, cy = 0, cz = 0;
      for (let k = first; k < first + 6; k++) {
        const u = p[k * 3 + a[0]], v = p[k * 3 + a[1]];
        u0 = Math.min(u0, u); u1 = Math.max(u1, u);
        v0 = Math.min(v0, v); v1 = Math.max(v1, v);
        cx += p[k * 3] / 6;
        cy += p[k * 3 + 1] / 6;
        cz += p[k * 3 + 2] / 6;
      }
      const hidden = (ny < -0.5 && cy < 0.2) || (ny > 0.5 && cy > 4.4) || u1 - u0 < 1e-4 || v1 - v0 < 1e-4 || covered(p, first, [cx, cy, cz], [sx, ny, sz]);
      const k = scales[gi] ?? 1;
      quads.push({ geo: gi, first, a, min: [u0, v0], w: (u1 - u0) * k, h: (v1 - v0) * k, k, hidden });
    }
  });

  const visible = quads.filter((q) => !q.hidden);
  const area = visible.reduce((s, q) => s + q.w * q.h, 0);
  let density = Math.sqrt((0.7 * size * size) / area);
  let place: Map<Quad, [number, number]> | null = null;
  while (!(place = shelf(visible, density, size))) density *= 0.96;

  const uvs = geos.map((g) => new Float32Array(g.getAttribute('position').count * 2).fill(1 / size)); // mặt khuất → texel (1, 1)
  for (const q of visible) {
    const [x0, y0] = place.get(q)!;
    const p = geos[q.geo].getAttribute('position').array as ArrayLike<number>;
    for (let k = q.first; k < q.first + 6; k++) {
      uvs[q.geo][k * 2] = (x0 + PAD + (p[k * 3 + q.a[0]] - q.min[0]) * q.k * density) / size;
      uvs[q.geo][k * 2 + 1] = (y0 + PAD + (p[k * 3 + q.a[1]] - q.min[1]) * q.k * density) / size;
    }
  }
  geos.forEach((g, i) => g.setAttribute('uv1', new THREE.BufferAttribute(uvs[i], 2)));
  return density;
}

/** Xếp kệ theo chiều cao giảm dần; null nếu không vừa. Góc (0, 0) 4 × 4 texel để dành cho mặt khuất. */
function shelf(quads: Quad[], density: number, size: number) {
  const dims = new Map(quads.map((q) => [q, [Math.ceil(q.w * density) + PAD * 2, Math.ceil(q.h * density) + PAD * 2] as const]));
  const order = [...quads].sort((a, b) => dims.get(b)![1] - dims.get(a)![1] || dims.get(b)![0] - dims.get(a)![0]);
  const out = new Map<Quad, [number, number]>();
  let x = 4, y = 0, rowH = 4;
  for (const q of order) {
    const [w, h] = dims.get(q)!;
    if (w > size) return null;
    if (x + w > size) {
      y += rowH;
      x = 0;
      rowH = 0;
    }
    if (y + h > size) return null;
    out.set(q, [x, y]);
    x += w;
    rowH = Math.max(rowH, h);
  }
  return out;
}
