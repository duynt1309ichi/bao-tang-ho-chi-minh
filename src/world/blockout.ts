import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { exhibits } from '../content/exhibits';
import { rooms } from '../content/rooms';
import type { Area, ExhibitKind, Layout, ZoneId } from '../content/types';
import { ZONE_COLORS } from '../ui/tokens';
import { allDoors, cutWall } from './layout';
import { atlasRect, exhibitAtlas, signAtlas, welcomePanel } from './signs';
import { makeTexture, type TextureName } from './textures';

const WALL_T = 0.2;
const LINTEL_Y = 2.6;
const REVIEW = '#3e5c4a'; // --zone-review

type Uv = 'world' | [number, number, number, number];
interface MatSpec {
  color: string;
  roughness: number;
  metalness?: number;
  map?: TextureName | 'atlas' | 'signs' | 'welcome';
  emissive?: number;
  cast?: boolean;
}

/** Vật liệu theo design.md mục 2 ("Vật liệu 3D"). */
const MATS = {
  wall: { color: '#ffffff', roughness: 0.92, map: 'plaster' }, // không đổ bóng: có trần, đèn bóng chỉ dành cho bục + nhân vật
  trim: { color: '#f4efe4', roughness: 0.55 },
  wainscot: { color: '#cbbfa8', roughness: 0.7, map: 'plaster' },
  ceiling: { color: '#f4efe4', roughness: 1 },
  lamp: { color: '#fff3dc', roughness: 1, emissive: 3 },
  oak: { color: '#ffffff', roughness: 0.5, map: 'oak' },
  stone: { color: '#ffffff', roughness: 0.32, map: 'stone' },
  grass: { color: '#ffffff', roughness: 1, map: 'grass' },
  path: { color: '#cfc6b4', roughness: 0.85, map: 'stone' },
  fence: { color: '#6d665b', roughness: 0.8, cast: true },
  plinth: { color: '#f4efe4', roughness: 0.35, cast: true },
  dark: { color: '#2a2620', roughness: 0.6, cast: true },
  fixture: { color: '#2a2620', roughness: 0.6 },
  brass: { color: '#d9b26a', roughness: 0.3, metalness: 1, cast: true },
  atlas: { color: '#ffffff', roughness: 0.7, map: 'atlas' },
  signs: { color: '#ffffff', roughness: 0.7, map: 'signs' },
  welcome: { color: '#ffffff', roughness: 0.7, map: 'welcome' },
  review: { color: REVIEW, roughness: 0.6 },
  ...zoneMats(),
} satisfies Record<string, MatSpec>;
type MatKey = keyof typeof MATS;

function zoneMats() {
  const out: Record<string, MatSpec> = {};
  for (const [z, color] of Object.entries(ZONE_COLORS)) {
    out[`carpet${z}`] = { color, roughness: 1, map: 'carpet' };
    out[`zone${z}`] = { color, roughness: 0.45 };
    out[`gem${z}`] = { color, roughness: 0.2, metalness: 0.3, cast: true };
  }
  return out as Record<`carpet${ZoneId}` | `zone${ZoneId}` | `gem${ZoneId}`, MatSpec>;
}

/**
 * Dựng bảo tàng từ layout (HLD ADR-04 — bản blockout có vật liệu, dùng khi chưa có GLB từ Blender).
 * Trả về nhóm hiển thị (một mesh mỗi vật liệu), hình học va chạm (tường, trần, bục) và hàm đổi kích thước texture.
 */
export function buildBlockout(layout: Layout, textureSize = 1024) {
  const byMat = new Map<MatKey, THREE.BufferGeometry[]>();
  const solids: THREE.BufferGeometry[] = [];
  const add = (geo: THREE.BufferGeometry, mat: MatKey, opts: { solid?: boolean; uv?: Uv } = {}) => {
    if (geo.index) geo = geo.toNonIndexed();
    if (opts.uv && opts.uv !== 'world') remapUv(geo, opts.uv);
    else worldUv(geo);
    (byMat.get(mat) ?? byMat.set(mat, []).get(mat)!).push(geo);
    if (opts.solid) solids.push(geo);
  };
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) => new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz);
  const floor = (x: number, z: number, w: number, d: number, y = 0) => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(x + w / 2, y, z + d / 2);
  const ceil = (x: number, z: number, w: number, d: number, y: number) => new THREE.PlaneGeometry(w, d).rotateX(Math.PI / 2).translate(x + w / 2, y, z + d / 2);

  for (const area of layout.areas) {
    const [x, z, w, d] = area.rect;
    const hall = area.id === 'hallway' || area.id === 'lobby';
    add(floor(x, z, w, d), area.outdoor ? 'grass' : hall ? 'stone' : area.zone ? 'oak' : 'stone');
    if (area.zone) add(floor(x + 1.5, z + 1.5, w - 3, d - 3, 0.005), `carpet${area.zone}`);
    if (area.outdoor) {
      // Lối đi lát đá từ cổng tới cửa sảnh.
      add(floor(x + 2, -1.5, w - 2, 3, 0.005), 'path');
      for (const wall of areaWalls(area)) add(wall, 'fence', { solid: true });
      continue;
    }
    for (const wall of areaWalls(area)) add(wall, 'wall', { solid: true });
    for (const s of areaWalls(area, 1.1, 0, WALL_T + 0.02)) add(s, 'wainscot'); // ốp chân tường
    for (const s of areaWalls(area, 0.05, 1.1, WALL_T + 0.06)) add(s, 'trim'); // nẹp ốp
    for (const s of areaWalls(area, 0.16, 0, WALL_T + 0.04)) add(s, 'trim'); // phào chân tường
    for (const s of areaWalls(area, 0.22, area.height - 0.22, WALL_T + 0.08)) add(s, 'trim'); // phào trần
    add(ceil(x, z, w, d, area.height), 'ceiling', { solid: true });
    // Hai dải đèn trần dọc cạnh dài (phát sáng, bloom làm nhòe nhẹ).
    const long = w >= d;
    for (const k of [0.3, 0.7]) {
      const y = area.height - 0.02;
      add(long ? ceil(x + 1, z + d * k - 0.2, w - 2, 0.4, y) : ceil(x + w * k - 0.2, z + 1, 0.4, d - 2, y), 'lamp');
    }
  }

  // Khung cửa: lanh tô + hai trụ, màu khu của phòng (sảnh/hành lang: phào ngà).
  for (const area of layout.areas) {
    for (const door of area.doors ?? []) {
      if (area.outdoor) continue;
      const mat: MatKey = area.zone ? `zone${area.zone}` : area.id === 'review' ? 'review' : 'trim';
      const h = area.height - LINTEL_Y;
      const [cx, cz] = door.center;
      const t = WALL_T * 2 + 0.08;
      const alongX = door.axis === 'x';
      const at = (along: number, y: number, len: number, hh: number, tt = t) =>
        alongX ? box(cx + along, y, cz, len, hh, tt) : box(cx, y, cz + along, tt, hh, len);
      add(at(0, LINTEL_Y + h / 2, door.width, h, WALL_T * 2), 'wall');
      add(at(0, LINTEL_Y + 0.1, door.width + 0.3, 0.2), mat);
      // Trụ phủ lên đầu tường (tránh hai mặt trùng nhau gây sọc z-fighting).
      for (const s of [-1, 1]) add(at(s * door.width / 2, LINTEL_Y / 2, 0.15, LINTEL_Y), mat);
    }
  }

  // Biển phòng phía hành lang + biển cổng sảnh.
  const signEntries = [
    ...rooms.map((r) => ({ kicker: `PHÒNG ${r.id.slice(1)} · CHƯƠNG ${r.chapter}`, title: r.title, color: ZONE_COLORS[r.zone], area: r.id as string })),
    { kicker: 'CUỐI HÀNH LANG', title: 'Phòng ôn tập', color: REVIEW, area: 'review' },
    { kicker: 'GIÁO TRÌNH TRIẾT HỌC MÁC – LÊNIN', title: 'Bảo tàng Triết học', color: '#2a2620', area: 'lobby' },
  ];
  const signs = signAtlas(signEntries);
  signEntries.forEach((e, i) => {
    const area = layout.areas.find((a) => a.id === e.area)!;
    const door = area.doors?.[0];
    if (!door) return;
    const other = layout.areas.find((a) => a.id === door.to)!;
    const [ox, oz, ow, od] = other.rect;
    const [cx, cz] = door.center;
    const dir = door.axis === 'x' ? Math.sign(oz + od / 2 - cz) : Math.sign(ox + ow / 2 - cx);
    const y = LINTEL_Y + 0.75;
    const plane = new THREE.PlaneGeometry(2.4, 0.6);
    const off = WALL_T + 0.02;
    if (door.axis === 'x') plane.rotateY(dir > 0 ? 0 : Math.PI).translate(cx, y, cz + dir * off);
    else plane.rotateY(dir > 0 ? Math.PI / 2 : -Math.PI / 2).translate(cx + dir * off, y, cz);
    add(plane, 'signs', { uv: signs.rect(i) });
  });

  // Pano chào ở sảnh, phía trên cửa ra hành lang (SRS BR-S07).
  const lobby = layout.areas.find((a) => a.id === 'lobby')!;
  const toHall = lobby.doors!.find((d) => d.to === 'hallway')!;
  add(new THREE.PlaneGeometry(5.2, 2.6).rotateY(-Math.PI / 2).translate(toHall.center[0] - WALL_T - 0.035, 4.25, toHall.center[1]), 'welcome', { uv: [0, 0, 1, 1] });
  add(box(toHall.center[0] - WALL_T - 0.015, 4.25, toHall.center[1], 0.03, 2.75, 5.35), 'brass');

  // Hiện vật theo loại; mặt chữ lấy từ atlas (ô = thứ tự trong exhibits.ts).
  for (const p of layout.exhibits) {
    const index = exhibits.findIndex((e) => e.id === p.id);
    const e = exhibits[index];
    const zone = rooms.find((r) => r.id === e.room)!.zone;
    const m = new THREE.Matrix4().makeRotationY(p.rotY).setPosition(p.pos[0], 0, p.pos[2]);
    for (const part of exhibitParts(e.kind, zone, atlasRect(index))) add(part.geo.applyMatrix4(m), part.mat, { solid: part.solid, uv: part.uv });
  }
  // Đèn rọi 3200 K (design.md): chóa đèn trên trần + vệt sáng giả trên sàn — không tốn đèn thật.
  const pools: THREE.BufferGeometry[] = [];
  for (const p of layout.exhibits) {
    const area = layout.areas.find((a) => inside(a, p.pos[0], p.pos[2]))!;
    const fx = p.pos[0] + Math.sin(p.rotY) * 0.5, fz = p.pos[2] + Math.cos(p.rotY) * 0.5;
    add(new THREE.CylinderGeometry(0.09, 0.12, 0.18, 12).translate(fx, area.height - 0.09, fz), 'fixture');
    add(new THREE.CircleGeometry(0.08, 12).rotateX(Math.PI / 2).translate(fx, area.height - 0.185, fz), 'lamp');
    pools.push(new THREE.PlaneGeometry(2.4, 2.4).rotateX(-Math.PI / 2).translate(p.pos[0] + Math.sin(p.rotY) * 0.35, 0.012, p.pos[2] + Math.cos(p.rotY) * 0.35));
  }

  for (const s of layout.quizStations) {
    const m = new THREE.Matrix4().makeRotationY(s.rotY).setPosition(s.pos[0], 0, s.pos[2]);
    add(new THREE.CylinderGeometry(0.3, 0.36, 1.05, 24).translate(0, 0.525, 0).applyMatrix4(m), 'review', { solid: true });
    add(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 24).translate(0, 1.075, 0).applyMatrix4(m), 'brass');
  }

  const atlas = exhibitAtlas(exhibits, rooms);
  const welcome = welcomePanel();
  const textures = new Map<TextureName, THREE.CanvasTexture>();
  const group = new THREE.Group();
  for (const [key, geos] of byMat) {
    const spec: MatSpec = MATS[key];
    const mat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: spec.roughness, metalness: spec.metalness ?? 0 });
    if (spec.map === 'atlas') mat.map = atlas;
    else if (spec.map === 'signs') mat.map = signs.tex;
    else if (spec.map === 'welcome') mat.map = welcome;
    else if (spec.map) mat.map = textures.get(spec.map) ?? textures.set(spec.map, makeTexture(spec.map, textureSize)).get(spec.map)!;
    if (spec.emissive) {
      mat.emissive.set(spec.color);
      mat.emissiveIntensity = spec.emissive;
    }
    const mesh = new THREE.Mesh(mergeGeometries(geos), mat);
    mesh.castShadow = Boolean(spec.cast);
    mesh.receiveShadow = !spec.emissive;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
  }
  const pool = new THREE.Mesh(
    mergeGeometries(pools),
    new THREE.MeshBasicMaterial({ map: radialTexture(), color: '#ffbb78', transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  pool.matrixAutoUpdate = false;
  group.add(pool);
  const collider = mergeGeometries(solids.map(toPositionOnly));
  return { group, collider, textures };
}

function inside(a: Area, x: number, z: number) {
  const [ax, az, w, d] = a.rect;
  return x >= ax && x <= ax + w && z >= az && z <= az + d;
}

/** Vệt sáng tròn mờ dần ra mép. */
function radialTexture() {
  const c = Object.assign(document.createElement('canvas'), { width: 128, height: 128 });
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface Part {
  geo: THREE.BufferGeometry;
  mat: MatKey;
  solid?: boolean;
  uv?: Uv;
}

/** Hình khối từng loại hiện vật trong hệ tọa độ riêng (mặt trước hướng +z, gốc ở sàn). Mô hình thật thay ở M4/M5. */
function exhibitParts(kind: ExhibitKind, zone: ZoneId, cell: [number, number, number, number]): Part[] {
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) => new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz);
  const face = (size: number, y: number, z: number, tilt = 0) => ({ geo: new THREE.PlaneGeometry(size, size).rotateX(-tilt).translate(0, y, z), mat: 'atlas' as const, uv: cell });
  switch (kind) {
    case 'text': // pano đứng
      return [
        { geo: box(0, 1.05, 0, 1.0, 1.9, 0.08), mat: 'dark', solid: true },
        { geo: box(0, 0.03, 0, 0.7, 0.06, 0.4), mat: 'brass' },
        { geo: box(0, 2.02, 0, 1.04, 0.04, 0.1), mat: `zone${zone}` },
        face(0.92, 1.4, 0.041),
      ];
    case 'portrait': // khung tranh trên giá
      return [
        { geo: box(0, 0.5, -0.05, 0.08, 1.0, 0.08), mat: 'dark', solid: true },
        { geo: box(0, 0.03, -0.05, 0.6, 0.06, 0.45), mat: 'dark' },
        { geo: box(0, 1.45, 0, 1.06, 1.06, 0.06), mat: 'brass', solid: true },
        face(0.94, 1.45, 0.031),
      ];
    case 'model': // bục trắng + mô hình tượng trưng
      return [
        { geo: box(0, 0.5, 0, 0.8, 1.0, 0.8), mat: 'plinth', solid: true },
        { geo: box(0, 1.02, 0, 0.86, 0.04, 0.86), mat: 'trim' },
        { geo: new THREE.IcosahedronGeometry(0.24, 0).translate(0, 1.3, 0), mat: `gem${zone}` },
        face(0.42, 0.62, 0.401),
      ];
    case 'interactive': // bệ tối viền đồng — thao tác 🎛 ở M4
      return [
        { geo: box(0, 0.5, 0, 0.9, 1.0, 0.9), mat: 'dark', solid: true },
        { geo: box(0, 1.01, 0, 0.94, 0.03, 0.94), mat: 'brass' },
        { geo: new THREE.TorusKnotGeometry(0.16, 0.05, 64, 8).translate(0, 1.32, 0), mat: `gem${zone}` },
        face(0.46, 0.62, 0.451),
      ];
  }
}

/**
 * Các bức tường của khu, đặt lùi vào trong nửa bề dày để hai khu kề nhau không chồng mặt.
 * Mặc định cao cả khu; truyền `height/y0/thick` để dựng phào chạy theo cùng các đoạn tường.
 */
function areaWalls(area: Area, height = area.height, y0 = 0, thick = WALL_T): THREE.BufferGeometry[] {
  const [x, z, w, d] = area.rect;
  const half = WALL_T / 2;
  const sides: { axis: 'x' | 'z'; fixed: number; start: number; end: number; inward: number }[] = [
    { axis: 'x', fixed: z, start: x, end: x + w, inward: +half },
    { axis: 'x', fixed: z + d, start: x, end: x + w, inward: -half },
    { axis: 'z', fixed: x, start: z, end: z + d, inward: +half },
    { axis: 'z', fixed: x + w, start: z, end: z + d, inward: -half },
  ];
  const out: THREE.BufferGeometry[] = [];
  const cy = y0 + height / 2;
  for (const s of sides) {
    for (const seg of cutWall(s.axis, s.fixed, s.start, s.end, allDoors)) {
      const len = s.axis === 'x' ? seg.to[0] - seg.from[0] : seg.to[1] - seg.from[1];
      const mid = (s.axis === 'x' ? seg.from[0] + seg.to[0] : seg.from[1] + seg.to[1]) / 2;
      out.push(
        s.axis === 'x'
          ? new THREE.BoxGeometry(len, height, thick).translate(mid, cy, s.fixed + s.inward)
          : new THREE.BoxGeometry(thick, height, len).translate(s.fixed + s.inward, cy, mid),
      );
    }
  }
  return out;
}

/** UV theo mét trong không gian thế giới, chiếu theo trục trội của pháp tuyến — texture lát đều mọi khối. */
export function worldUv(g: THREE.BufferGeometry) {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    const [u, v] = ay >= ax && ay >= az ? [pos.getX(i), pos.getZ(i)] : ax >= az ? [pos.getZ(i), pos.getY(i)] : [pos.getX(i), pos.getY(i)];
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Ép UV [0, 1] của mặt phẳng vào ô atlas [u0, v0, u1, v1]. */
function remapUv(g: THREE.BufferGeometry, [u0, v0, u1, v1]: [number, number, number, number]) {
  const uv = g.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
}

function toPositionOnly(g: THREE.BufferGeometry) {
  const c = new THREE.BufferGeometry();
  c.setAttribute('position', g.getAttribute('position'));
  return c;
}
