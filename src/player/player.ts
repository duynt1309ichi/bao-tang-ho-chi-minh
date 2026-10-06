import * as THREE from 'three';
import type { MeshBVH } from 'three-mesh-bvh';
import type { Spawn } from '../content/types';
import type { Character } from './character';
import { resolveCapsule } from './collision';

export const SPEED = { walk: 2.0, run: 4.5 }; // m/s — BR-S02
const TURN_RATE = 15; // đạt hướng mới trong ~0,2 s
const FALL_LIMIT = -2;

/** Nhân vật người chơi: vị trí, hướng, va chạm; mô hình + hoạt ảnh gắn bằng `setCharacter` (FR-02, FR-04). */
export class Player {
  readonly object = new THREE.Group();
  readonly feet = this.object.position;
  character: Character | null = null;
  private body = new THREE.Group();

  constructor() {
    this.object.add(this.body);
  }

  /** Đổi mô hình ngay, giữ vị trí và hướng (FR-02 2a). */
  setCharacter(c: Character) {
    this.character = c;
    this.body.clear();
    this.body.add(c.object);
  }

  set visible(v: boolean) {
    this.body.visible = v;
  }

  teleport(spawn: Spawn) {
    this.feet.set(...spawn.pos);
    this.object.rotation.y = spawn.rotY;
  }

  /**
   * Di chuyển theo hướng camera (FR-04). `forward` là hướng ngang của camera.
   * Trả về true nếu nhân vật rơi khỏi bản đồ (FR-07 a) để nơi gọi đưa về sảnh.
   */
  update(dt: number, move: { right: number; forward: number }, run: boolean, forward: THREE.Vector3, bvh: MeshBVH, faceYaw?: number) {
    const speed = run ? SPEED.run : SPEED.walk;
    // right = forward × up
    const vx = (forward.x * move.forward - forward.z * move.right) * speed;
    const vz = (forward.z * move.forward + forward.x * move.right) * speed;
    this.feet.x += vx * dt;
    this.feet.z += vz * dt;
    resolveCapsule(this.feet, bvh);

    const target = faceYaw ?? (vx || vz ? Math.atan2(vx, vz) : undefined);
    if (target !== undefined) {
      const r = this.object.rotation;
      const diff = Math.atan2(Math.sin(target - r.y), Math.cos(target - r.y));
      r.y += diff * Math.min(1, TURN_RATE * dt);
    }
    return this.feet.y < FALL_LIMIT;
  }
}
