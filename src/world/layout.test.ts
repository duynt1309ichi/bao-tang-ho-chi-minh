import { describe, expect, it } from 'vitest';
import { rooms } from '../content/rooms';
import { allDoors, areaAt, cutWall, layout } from './layout';

describe('cutWall', () => {
  it('khoét cửa giữa bức tường', () => {
    const segs = cutWall('x', -2, 0, 10, [{ to: 'hallway', center: [5, -2], width: 2, axis: 'x' }]);
    expect(segs).toEqual([
      { from: [0, -2], to: [4, -2] },
      { from: [6, -2], to: [10, -2] },
    ]);
  });
  it('bỏ qua cửa không nằm trên cạnh này', () => {
    expect(cutWall('x', 0, 0, 10, [{ to: 'hallway', center: [5, -2], width: 2, axis: 'x' }])).toHaveLength(1);
  });
  it('cửa rộng bằng cả cạnh thì không còn tường', () => {
    expect(cutWall('z', 0, -2, 2, [{ to: 'lobby', center: [0, 0], width: 4, axis: 'z' }])).toEqual([]);
  });
});

describe('areaAt', () => {
  it('nhận đúng khu vực', () => {
    expect(areaAt(layout.areas, -30, 0)).toBe('courtyard');
    expect(areaAt(layout.areas, -7, 0)).toBe('lobby');
    expect(areaAt(layout.areas, 20, 0)).toBe('hallway');
    expect(areaAt(layout.areas, 15, -7)).toBe('P03');
    expect(areaAt(layout.areas, 60, 0)).toBe('review');
    expect(areaAt(layout.areas, 100, 100)).toBeNull();
  });
});

// Ràng buộc bố cục (SRS BR-S04, BR-S06; LLD 1.3). FR-26 sẽ gom các luật này vào validate-content.
describe('layout.json', () => {
  const area = (id: string) => layout.areas.find((a) => a.id === id)!;

  it('đủ 10 phòng, đúng khu', () => {
    for (const r of rooms) expect(area(r.id).zone).toBe(r.zone);
  });

  it('hành lang rộng ≥ 3 m, mọi cửa rộng ≥ 1,6 m', () => {
    expect(area('hallway').rect[3]).toBeGreaterThanOrEqual(3);
    for (const d of allDoors) expect(d.width).toBeGreaterThanOrEqual(1.6);
  });

  it('P04 rộng ≥ 1,5 lần phòng thường', () => {
    const size = (id: string) => area(id).rect[2] * area(id).rect[3];
    const others = rooms.filter((r) => r.id !== 'P04').map((r) => size(r.id));
    expect(size('P04')).toBeGreaterThanOrEqual(1.5 * (others.reduce((a, b) => a + b) / others.length));
  });

  it('63 hiện vật, mã duy nhất, mỗi hiện vật nằm trong một phòng', () => {
    const ids = layout.exhibits.map((e) => e.id);
    expect(ids).toHaveLength(63);
    expect(new Set(ids).size).toBe(63);
    for (const e of layout.exhibits) expect(areaAt(layout.areas, e.pos[0], e.pos[2])).toMatch(/^P\d\d$/);
  });

  it('10 trạm trắc nghiệm trong phòng ôn tập', () => {
    expect(layout.quizStations).toHaveLength(10);
    for (const s of layout.quizStations) expect(areaAt(layout.areas, s.pos[0], s.pos[2])).toBe('review');
  });
});
