import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { Area, Layout } from '../content/types';
import { ZONE_COLORS } from '../ui/tokens';
import { allDoors, cutWall } from './layout';

const WALL_T = 0.2;
const LINTEL_Y = 2.6;
const COLORS = {
  wall: '#e9e3d6',
  fence: '#8a8172',
  floorIndoor: '#cfc6b4',
  floorHall: '#d9d3c7',
  grass: '#6f8a55',
  plinth: '#f4efe4',
  station: '#3e5c4a',
};

/**
 * Dựng bảo tàng bằng khối hộp từ layout (HLD ADR-04). Trả về nhóm hiển thị
 * và hình học va chạm (tường, bục) đã gộp — sàn phẳng y = 0 nên không đưa vào va chạm.
 */
export function buildBlockout(layout: Layout) {
  const byColor = new Map<string, THREE.BufferGeometry[]>();
  const solids: THREE.BufferGeometry[] = [];
  const add = (geo: THREE.BufferGeometry, color: string, solid: boolean) => {
    (byColor.get(color) ?? byColor.set(color, []).get(color)!).push(geo);
    if (solid) solids.push(geo);
  };
  const box = (cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) =>
    new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz);

  for (const area of layout.areas) {
    const [x, z, w, d] = area.rect;
    const floorColor = area.outdoor ? COLORS.grass : area.id === 'hallway' || area.id === 'lobby' ? COLORS.floorHall : COLORS.floorIndoor;
    add(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2).translate(x + w / 2, 0, z + d / 2), floorColor, false);
    if (area.zone) {
      add(new THREE.PlaneGeometry(w - 3, d - 3).rotateX(-Math.PI / 2).translate(x + w / 2, 0.01, z + d / 2), ZONE_COLORS[area.zone], false);
    }
    for (const wall of areaWalls(area)) add(wall, area.outdoor ? COLORS.fence : COLORS.wall, true);
  }

  // Lanh tô phía trên các cửa trong nhà, màu theo khu của phòng.
  for (const area of layout.areas) {
    for (const door of area.doors ?? []) {
      if (area.outdoor || door.to === 'courtyard') continue;
      const h = area.height - LINTEL_Y;
      const color = area.zone ? ZONE_COLORS[area.zone] : COLORS.wall;
      const [cx, cz] = door.center;
      const g = door.axis === 'x' ? box(cx, LINTEL_Y + h / 2, cz, door.width, h, WALL_T * 2) : box(cx, LINTEL_Y + h / 2, cz, WALL_T * 2, h, door.width);
      add(g, color, false);
    }
  }

  // Bục + khối tượng trưng cho hiện vật (thay bằng mô hình thật ở M2–M4).
  for (const e of layout.exhibits) {
    const [px, , pz] = e.pos;
    const zone = layout.areas.find((a) => a.zone && inside(a, px, pz))?.zone;
    add(box(px, 0.5, pz, 0.8, 1, 0.8), COLORS.plinth, true);
    add(box(px, 1.2, pz, 0.4, 0.4, 0.4), zone ? ZONE_COLORS[zone] : COLORS.plinth, false);
  }
  for (const s of layout.quizStations) add(box(s.pos[0], 0.55, s.pos[2], 0.6, 1.1, 0.6), COLORS.station, true);

  const group = new THREE.Group();
  for (const [color, geos] of byColor) {
    group.add(new THREE.Mesh(mergeGeometries(geos.map(toPositionNormal)), new THREE.MeshStandardMaterial({ color, roughness: 0.85 })));
  }
  const collider = mergeGeometries(solids.map((g) => toPositionOnly(g)));
  return { group, collider };
}

function inside(a: Area, x: number, z: number) {
  const [ax, az, w, d] = a.rect;
  return x >= ax && x <= ax + w && z >= az && z <= az + d;
}

/** Bốn bức tường của khu, đặt lùi vào trong nửa bề dày để hai khu kề nhau không chồng mặt. */
function areaWalls(area: Area): THREE.BufferGeometry[] {
  const [x, z, w, d] = area.rect;
  const h = area.height;
  const half = WALL_T / 2;
  const sides: { axis: 'x' | 'z'; fixed: number; start: number; end: number; inward: number }[] = [
    { axis: 'x', fixed: z, start: x, end: x + w, inward: +half },
    { axis: 'x', fixed: z + d, start: x, end: x + w, inward: -half },
    { axis: 'z', fixed: x, start: z, end: z + d, inward: +half },
    { axis: 'z', fixed: x + w, start: z, end: z + d, inward: -half },
  ];
  const out: THREE.BufferGeometry[] = [];
  for (const s of sides) {
    for (const seg of cutWall(s.axis, s.fixed, s.start, s.end, allDoors)) {
      const len = s.axis === 'x' ? seg.to[0] - seg.from[0] : seg.to[1] - seg.from[1];
      const mid = (s.axis === 'x' ? seg.from[0] + seg.to[0] : seg.from[1] + seg.to[1]) / 2;
      out.push(
        s.axis === 'x'
          ? new THREE.BoxGeometry(len, h, WALL_T).translate(mid, h / 2, s.fixed + s.inward)
          : new THREE.BoxGeometry(WALL_T, h, len).translate(s.fixed + s.inward, h / 2, mid),
      );
    }
  }
  return out;
}

function toPositionNormal(g: THREE.BufferGeometry) {
  g.deleteAttribute('uv');
  return g;
}

function toPositionOnly(g: THREE.BufferGeometry) {
  const c = new THREE.BufferGeometry();
  c.setAttribute('position', g.getAttribute('position'));
  c.setIndex(g.getIndex());
  return c;
}
