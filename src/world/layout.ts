import layoutJson from '../content/layout.json';
import { rooms } from '../content/rooms';
import type { Area, AreaId, Door, Layout } from '../content/types';

export const layout = layoutJson as Layout;

/** Khu vực chứa điểm (x, z); null nếu ở ngoài mọi khu. Hàm thuần. */
export function areaAt(areas: Area[], x: number, z: number): AreaId | null {
  for (const a of areas) {
    const [ax, az, w, d] = a.rect;
    if (x >= ax && x <= ax + w && z >= az && z <= az + d) return a.id;
  }
  return null;
}

const AREA_NAMES: Partial<Record<AreaId, string>> = {
  courtyard: 'Khuôn viên',
  lobby: 'Sảnh',
  hallway: 'Hành lang',
  review: 'Phòng ôn tập',
};

export function areaName(id: AreaId): string {
  const room = rooms.find((r) => r.id === id);
  return room ? `Phòng ${id.slice(1)} — ${room.title}` : AREA_NAMES[id]!;
}

export interface WallSegment {
  /** Điểm đầu và cuối trên mặt phẳng xz. */
  from: [number, number];
  to: [number, number];
}

/**
 * Cắt một cạnh tường của khu theo các cửa nằm trên cạnh đó. Hàm thuần.
 * Cạnh chạy dọc `axis` tại tọa độ cố định `fixed`, từ `start` tới `end`.
 */
export function cutWall(axis: 'x' | 'z', fixed: number, start: number, end: number, doors: Door[]): WallSegment[] {
  const gaps = doors
    .filter((d) => d.axis === axis && Math.abs((axis === 'x' ? d.center[1] : d.center[0]) - fixed) < 0.01)
    .map((d) => {
      const c = axis === 'x' ? d.center[0] : d.center[1];
      return [c - d.width / 2, c + d.width / 2] as const;
    })
    .sort((a, b) => a[0] - b[0]);

  const spans: [number, number][] = [];
  let cursor = start;
  for (const [g0, g1] of gaps) {
    if (g1 <= start || g0 >= end) continue;
    if (g0 > cursor) spans.push([cursor, g0]);
    cursor = Math.max(cursor, g1);
  }
  if (cursor < end) spans.push([cursor, end]);

  return spans.map(([a, b]) =>
    axis === 'x' ? { from: [a, fixed], to: [b, fixed] } : { from: [fixed, a], to: [fixed, b] },
  );
}

/** Mọi cửa trong bố cục (mỗi cửa khai báo một lần ở một khu, nhưng cắt tường của cả hai bên). */
export const allDoors: Door[] = layout.areas.flatMap((a) => a.doors ?? []);
