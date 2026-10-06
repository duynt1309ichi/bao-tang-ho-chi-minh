import { mkdirSync, writeFileSync } from 'node:fs';
import { buildGeometry, MATS, type MatSpec } from '../src/world/geometry';
import { LIGHTMAP_SIZE } from '../src/world/lightmap';
import { layout } from '../src/world/layout';

const OUT = 'assets-src/bake';

// Màu trung bình (sRGB) của các texture CC0 — chỉ dùng cho ánh sáng dội trong bake.
const AVG: Partial<Record<string, string>> = { parquet: '#8a6142', marble: '#b4a587', grass: '#4d6534', path: '#b0a690' };

/** Ghi scene.obj (mỗi nhóm vật liệu một object, vt = uv1) và scene.json (vật liệu, đèn) cho tools/blender/bake_lightmap.py. */
export function exportBake() {
  const { groups, spots, strips, density } = buildGeometry(layout);
  const lines: string[] = [];
  let base = 1;
  for (const g of groups) {
    const pos = g.geo.getAttribute('position');
    const nor = g.geo.getAttribute('normal');
    const uv1 = g.geo.getAttribute('uv1');
    lines.push(`o ${g.key}${g.baked ? '' : '__dyn'}`);
    for (let i = 0; i < pos.count; i++) lines.push(`v ${pos.getX(i).toFixed(4)} ${pos.getY(i).toFixed(4)} ${pos.getZ(i).toFixed(4)}`);
    for (let i = 0; i < pos.count; i++) lines.push(uv1 ? `vt ${uv1.getX(i).toFixed(6)} ${uv1.getY(i).toFixed(6)}` : 'vt 0 0');
    for (let i = 0; i < pos.count; i++) lines.push(`vn ${nor.getX(i).toFixed(4)} ${nor.getY(i).toFixed(4)} ${nor.getZ(i).toFixed(4)}`);
    for (let i = 0; i < pos.count; i += 3) {
      const f = [0, 1, 2].map((k) => base + i + k).map((n) => `${n}/${n}/${n}`);
      lines.push(`f ${f.join(' ')}`);
    }
    base += pos.count;
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/scene.obj`, lines.join('\n'));
  const materials = Object.fromEntries(
    Object.entries(MATS as Record<string, MatSpec>).map(([k, m]) => [k, { color: AVG[k] ?? m.color, roughness: m.roughness, metalness: m.metalness ?? 0, emissive: m.emissive ?? 0 }]),
  );
  writeFileSync(`${OUT}/scene.json`, JSON.stringify({ size: LIGHTMAP_SIZE, density, materials, spots, strips }, null, 1));
  console.log(`scene.obj: ${groups.length} nhóm, ${(base - 1).toLocaleString()} đỉnh; mật độ lightmap ${density.toFixed(1)} texel/m`);
}
