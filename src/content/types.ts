// Kiểu dữ liệu nội dung — nguồn: docs/sa/LLD.md mục 1.
export type ZoneId = 'A' | 'B' | 'C';
export type RoomId = 'P01' | 'P02' | 'P03' | 'P04' | 'P05' | 'P06' | 'P07' | 'P08' | 'P09' | 'P10';
export type AreaId = 'courtyard' | 'lobby' | 'hallway' | 'review' | RoomId;
export type PageRange = [from: number, to: number];
export type Vec3 = [number, number, number];

export interface Room {
  id: RoomId;
  zone: ZoneId;
  chapter: 1 | 2 | 3;
  title: string;
  pages: PageRange;
}

export interface Door {
  to: AreaId;
  center: [x: number, z: number];
  width: number;
  /** Trục của bức tường chứa cửa: 'x' = tường chạy dọc trục x (z cố định). */
  axis: 'x' | 'z';
}

export interface Area {
  id: AreaId;
  zone: ZoneId | null;
  /** [minX, minZ, rộng theo x, sâu theo z], đơn vị mét. */
  rect: [x: number, z: number, w: number, d: number];
  height: number;
  outdoor?: boolean;
  doors?: Door[];
}

export interface Spawn {
  pos: Vec3;
  rotY: number;
}

export interface ExhibitPlacement {
  id: string;
  pos: Vec3;
  /** Hướng mặt trước: xoay trục +z quanh trục y. */
  rotY: number;
  viewpoint: { pos: Vec3; target: Vec3 };
}

export interface Layout {
  version: 1;
  areas: Area[];
  spawns: Record<'courtyard' | 'lobby' | 'review-door', Spawn>;
  exhibits: ExhibitPlacement[];
  quizStations: { room: RoomId; pos: Vec3; rotY: number }[];
}
