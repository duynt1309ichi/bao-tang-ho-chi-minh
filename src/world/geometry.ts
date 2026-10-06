import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { exhibits } from '../content/exhibits';
import { rooms } from '../content/rooms';
import type { Area, ExhibitKind, Layout, Vec3, ZoneId } from '../content/types';
import { ZONE_COLORS } from '../ui/tokens';
import { allDoors, cutWall } from './layout';
import { packLightmap } from './lightmap';
import { atlasRect, signRect } from './signs';

// Hình học bảo tàng sinh từ layout.json (HLD ADR-04). File này không đụng DOM nên chạy được cả trong Node
// (scripts/export-bake.ts xuất cho Blender bake lightmap) lẫn trình duyệt (world/blockout.ts dựng mesh).

const WALL_T = 0.2;
const LINTEL_Y = 2.6;
export const REVIEW_COLOR = '#3e5c4a'; // --zone-review

export type TexName = 'plaster' | 'parquet' | 'marble' | 'grass' | 'carpet';
export type CanvasName = 'atlas' | 'signs' | 'welcome' | 'museumMap' | 'about';
export interface MatSpec {
  color: string;
  roughness: number;
  metalness?: number;
  /** Texture CC0 (public/assets/tex) hoặc texture vẽ Canvas 2D (world/signs). */
  map?: TexName | CanvasName;
  /** Kích thước một ô texture ngoài thế giới (mét). */
  tile?: number;
  emissive?: number;
  cast?: boolean;
}

/** Vật liệu theo design.md mục 2 ("Vật liệu 3D"). */
export const MATS = {
  wall: { color: '#e9e3d6', roughness: 0.92, map: 'plaster', tile: 3 },
  trim: { color: '#f4efe4', roughness: 0.55 },
  wainscot: { color: '#cbbfa8', roughness: 0.75, map: 'plaster', tile: 3 },
  ceiling: { color: '#f4efe4', roughness: 1 },
  lamp: { color: '#fff3dc', roughness: 1, emissive: 3 },
  parquet: { color: '#ffffff', roughness: 1, map: 'parquet', tile: 2 },
  marble: { color: '#ffffff', roughness: 1, map: 'marble', tile: 3 },
  grass: { color: '#c4dca6', roughness: 1, map: 'grass', tile: 3 },
  path: { color: '#d8d0c2', roughness: 1, map: 'marble', tile: 2 },
  fence: { color: '#6d665b', roughness: 0.8, cast: true },
  plinth: { color: '#f4efe4', roughness: 0.35, cast: true },
  dark: { color: '#2a2620', roughness: 0.6, cast: true },
  fixture: { color: '#2a2620', roughness: 0.6 },
  brass: { color: '#d9b26a', roughness: 0.3, metalness: 1, cast: true },
  atlas: { color: '#ffffff', roughness: 0.7, map: 'atlas' },
  signs: { color: '#ffffff', roughness: 0.7, map: 'signs' },
  welcome: { color: '#ffffff', roughness: 0.7, map: 'welcome' },
  museumMap: { color: '#ffffff', roughness: 0.7, map: 'museumMap' },
  about: { color: '#ffffff', roughness: 0.7, map: 'about' },
  review: { color: REVIEW_COLOR, roughness: 0.6 },
  ...zoneMats(),
} satisfies Record<string, MatSpec>;
export type MatKey = keyof typeof MATS;

function zoneMats() {
  const out: Record<string, MatSpec> = {};
  for (const [z, color] of Object.entries(ZONE_COLORS)) {
    out[`carpet${z}`] = { color, roughness: 1, map: 'carpet', tile: 0.6 };
    out[`zone${z}`] = { color, roughness: 0.45 };
    out[`gem${z}`] = { color, roughness: 0.2, metalness: 0.3, cast: true };
  }
  return out as Record<`carpet${ZoneId}` | `zone${ZoneId}` | `gem${ZoneId}`, MatSpec>;
}

/** Bề mặt rộng, ánh sáng đều: ít texel lightmap hơn để dồn cho sàn, tường trong phòng. */
const LIGHTMAP_SCALE: Partial<Record<MatKey, number>> = { grass: 0.35, fence: 0.5, ceiling: 0.6 };

export interface Group {
  key: MatKey;
  /** true: hộp/mặt phẳng có uv1 lightmap; false: khối cong (đá quý, chóa đèn…) chiếu sáng động. */
  baked: boolean;
  geo: THREE.BufferGeometry;
}

/** Đèn rọi hiện vật 3200 K: vị trí chóa trên trần và điểm nhắm. */
export interface Spot {
  pos: Vec3;
  target: Vec3;
}

/** Dải đèn trần: tâm (đáy dải), kích thước theo x, z và diện tích sàn khu chứa nó (để chia công suất đèn đều theo m² sàn). */
export interface Strip {
  center: Vec3;
  size: [number, number];
  floorArea: number;
}

type Uv = [number, number, number, number];

export function buildGeometry(layout: Layout) {
  const parts = new Map<string, { key: MatKey; baked: boolean; geos: THREE.BufferGeometry[] }>();
  const solids: THREE.BufferGeometry[] = [];
  const occluders: THREE.Box3[] = [];
  const spots: Spot[] = [];
  const strips: Strip[] = [];
  const models: ModelPart[] = [];
  const add = (geo: THREE.BufferGeometry, key: MatKey, opts: { solid?: boolean; uv?: Uv; baked?: boolean } = {}) => {
    if (geo.index) geo = geo.toNonIndexed();
    if (geo.getAttribute('position').count === 36) occluders.push(new THREE.Box3().setFromBufferAttribute(geo.getAttribute('position') as THREE.BufferAttribute)); // hộp đặc
    if (opts.uv) remapUv(geo, opts.uv);
    else worldUv(geo, (MATS[key] as MatSpec).tile ?? 1);
    const baked = opts.baked ?? true;
    const id = baked ? key : `${key}:dyn`;
    (parts.get(id) ?? parts.set(id, { key, baked, geos: [] }).get(id)!).geos.push(geo);
    if (opts.solid) solids.push(geo);
  };
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) => new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz);
  const floor = (x: number, z: number, w: number, d: number, y = 0) => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(x + w / 2, y, z + d / 2);
  const ceil = (x: number, z: number, w: number, d: number, y: number) => new THREE.PlaneGeometry(w, d).rotateX(Math.PI / 2).translate(x + w / 2, y, z + d / 2);

  for (const area of layout.areas) {
    const [x, z, w, d] = area.rect;
    const hall = area.id === 'hallway' || area.id === 'lobby';
    add(floor(x, z, w, d), area.outdoor ? 'grass' : hall || !area.zone ? 'marble' : 'parquet');
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
    // Hai dải đèn trần dọc cạnh dài.
    const long = w >= d;
    for (const k of [0.3, 0.7]) {
      const y = area.height - 0.02;
      const [sx, sz, sw, sd] = long ? [x + 1, z + d * k - 0.2, w - 2, 0.4] : [x + w * k - 0.2, z + 1, 0.4, d - 2];
      add(ceil(sx, sz, sw, sd, y), 'lamp', { baked: false });
      strips.push({ center: [sx + sw / 2, y, sz + sd / 2], size: [sw, sd], floorArea: w * d });
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

  // Biển phòng phía hành lang + biển cổng sảnh — thứ tự khớp SIGN_ENTRIES.
  signAreas().forEach((areaId, i) => {
    const area = layout.areas.find((a) => a.id === areaId)!;
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
    add(plane, 'signs', { uv: signRect(i) });
  });

  // Sảnh (SRS BR-S07): pano chào trên cửa ra hành lang, sơ đồ bảo tàng (tường bắc), bảng "Về giáo trình" (tường nam).
  const lobby = layout.areas.find((a) => a.id === 'lobby')!;
  const toHall = lobby.doors!.find((d) => d.to === 'hallway')!;
  add(new THREE.PlaneGeometry(5.2, 2.6).rotateY(-Math.PI / 2).translate(toHall.center[0] - WALL_T - 0.035, 4.25, toHall.center[1]), 'welcome', { uv: [0, 0, 1, 1] });
  add(box(toHall.center[0] - WALL_T - 0.015, 4.25, toHall.center[1], 0.03, 2.75, 5.35), 'brass');
  const [lx, lz, lw, ld] = lobby.rect;
  const board = (key: MatKey, w: number, h: number, cx: number, cy: number, wallZ: number, dir: 1 | -1) => {
    const z = wallZ + dir * (WALL_T + 0.1);
    add(box(cx, cy, z - dir * 0.03, w + 0.12, h + 0.12, 0.05), 'dark', { solid: true });
    add(new THREE.PlaneGeometry(w, h).rotateY(dir > 0 ? 0 : Math.PI).translate(cx, cy, z), key, { uv: [0, 0, 1, 1] });
  };
  board('museumMap', 4.2, 2.52, lx + lw / 2, 2.1, lz, 1);
  board('about', 3.3, 2.2, lx + lw / 2, 2.0, lz + ld, -1);

  // Hiện vật theo loại; mặt chữ lấy từ atlas (ô = thứ tự trong exhibits.ts).
  for (const p of layout.exhibits) {
    const index = exhibits.findIndex((e) => e.id === p.id);
    const e = exhibits[index];
    const zone = rooms.find((r) => r.id === e.room)!.zone;
    const m = new THREE.Matrix4().makeRotationY(p.rotY).setPosition(p.pos[0], 0, p.pos[2]);
    for (const part of exhibitParts(e.kind, zone, atlasRect(index))) {
      if (part.model) models.push({ id: p.id, key: part.mat, geo: part.geo, matrix: m.clone().multiply(new THREE.Matrix4().makeTranslation(...part.model)) });
      else add(part.geo.applyMatrix4(m), part.mat, { solid: part.solid, uv: part.uv, baked: part.baked });
    }

    // Đèn rọi 3200 K: chóa trên trần trước hiện vật, nhắm vào tâm mặt trưng bày.
    const area = layout.areas.find((a) => inside(a, p.pos[0], p.pos[2]))!;
    const fx = p.pos[0] + Math.sin(p.rotY) * 0.9, fz = p.pos[2] + Math.cos(p.rotY) * 0.9;
    add(new THREE.CylinderGeometry(0.09, 0.12, 0.18, 12).translate(fx, area.height - 0.09, fz), 'fixture', { baked: false });
    add(new THREE.CircleGeometry(0.08, 12).rotateX(Math.PI / 2).translate(fx, area.height - 0.185, fz), 'lamp', { baked: false });
    spots.push({ pos: [fx, area.height - 0.2, fz], target: [p.pos[0], 1.2, p.pos[2]] });
  }

  for (const s of layout.quizStations) {
    const m = new THREE.Matrix4().makeRotationY(s.rotY).setPosition(s.pos[0], 0, s.pos[2]);
    add(new THREE.CylinderGeometry(0.3, 0.36, 1.05, 24).translate(0, 0.525, 0).applyMatrix4(m), 'review', { solid: true, baked: false });
    add(new THREE.CylinderGeometry(0.34, 0.34, 0.05, 24).translate(0, 1.075, 0).applyMatrix4(m), 'brass', { baked: false });
  }

  const groups: Group[] = [...parts.values()].map((p) => ({ key: p.key, baked: p.baked, geo: mergeGeometries(p.geos) }));
  const baked = groups.filter((g) => g.baked);
  const density = packLightmap(baked.map((g) => g.geo), occluders, baked.map((g) => LIGHTMAP_SCALE[g.key] ?? 1));
  const collider = mergeGeometries(solids.map(toPositionOnly));
  return { groups, models, collider, spots, strips, density };
}

/** Khu mang biển ở cửa, theo thứ tự ô trong atlas biển (signs.ts SIGN_ENTRIES). */
export const signAreas = () => [...rooms.map((r) => r.id as string), 'review', 'lobby'];

function inside(a: Area, x: number, z: number) {
  const [ax, az, w, d] = a.rect;
  return x >= ax && x <= ax + w && z >= az && z <= az + d;
}

interface Part {
  geo: THREE.BufferGeometry;
  mat: MatKey;
  solid?: boolean;
  uv?: Uv;
  baked?: boolean;
  /** Mô hình 🧊 xoay được (FR-13 2a): không gộp, `geo` có tâm ở gốc, đặt tại điểm này (tọa độ riêng). */
  model?: Vec3;
}

/** Mô hình 🧊 của một hiện vật: mesh riêng để bảng hiện vật xoay được. `matrix` đặt `geo` vào thế giới. */
export interface ModelPart {
  id: string;
  key: MatKey;
  geo: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
}

/** Hình khối từng loại hiện vật trong hệ tọa độ riêng (mặt trước hướng +z, gốc ở sàn). Mô hình thật thay ở M4/M5. */
function exhibitParts(kind: ExhibitKind, zone: ZoneId, cell: Uv): Part[] {
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) => new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz);
  const face = (size: number, y: number, z: number) => ({ geo: new THREE.PlaneGeometry(size, size).translate(0, y, z), mat: 'atlas' as const, uv: cell });
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
        { geo: new THREE.IcosahedronGeometry(0.24, 0), mat: `gem${zone}`, model: [0, 1.3, 0] },
        face(0.42, 0.62, 0.401),
      ];
    case 'interactive': // bệ tối viền đồng — thao tác 🎛 ở M4
      return [
        { geo: box(0, 0.5, 0, 0.9, 1.0, 0.9), mat: 'dark', solid: true },
        { geo: box(0, 1.01, 0, 0.94, 0.03, 0.94), mat: 'brass' },
        { geo: new THREE.TorusKnotGeometry(0.16, 0.05, 64, 8).translate(0, 1.32, 0), mat: `gem${zone}`, baked: false },
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

/** UV theo không gian thế giới (đơn vị = một ô `tile` mét), chiếu theo trục trội của pháp tuyến — texture lát đều mọi khối. */
function worldUv(g: THREE.BufferGeometry, tile: number) {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const ax = Math.abs(nor.getX(i)), ay = Math.abs(nor.getY(i)), az = Math.abs(nor.getZ(i));
    const [u, v] = ay >= ax && ay >= az ? [pos.getX(i), pos.getZ(i)] : ax >= az ? [pos.getZ(i), pos.getY(i)] : [pos.getX(i), pos.getY(i)];
    uv[i * 2] = u / tile;
    uv[i * 2 + 1] = v / tile;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Ép UV [0, 1] của mặt phẳng vào ô atlas [u0, v0, u1, v1]. */
function remapUv(g: THREE.BufferGeometry, [u0, v0, u1, v1]: Uv) {
  const uv = g.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
}

function toPositionOnly(g: THREE.BufferGeometry) {
  const c = new THREE.BufferGeometry();
  c.setAttribute('position', g.getAttribute('position'));
  return c;
}
