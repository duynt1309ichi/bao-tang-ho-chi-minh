import * as THREE from 'three';
import type { MeshBVH } from 'three-mesh-bvh';

const PITCH_LIMIT = THREE.MathUtils.degToRad(60);
export const ZOOM = { min: 1.5, max: 5, step: 0.5, initial: 3 };
const RAD_PER_PX = 0.0025;
const EYE = 1.6;
const PIVOT = 1.5;

/** Kẹp góc ngẩng/cúi trong [−60°, +60°] (FR-05). Hàm thuần. */
export function clampPitch(p: number) {
  return THREE.MathUtils.clamp(p, -PITCH_LIMIT, PITCH_LIMIT);
}

/** Hướng từ điểm nhìn tới camera theo yaw/pitch; pitch dương = camera ở trên. Hàm thuần. */
export function orbitDir(yaw: number, pitch: number, target = new THREE.Vector3()) {
  return target.set(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw));
}

const pivot = new THREE.Vector3();
const dir = new THREE.Vector3();
const ray = new THREE.Ray();

/** Camera góc nhìn thứ 3 / thứ nhất, chống xuyên tường (FR-05). */
export class FollowCamera {
  yaw = 0;
  pitch = 0.25;
  distance = ZOOM.initial;
  firstPerson = false;
  sensitivity = 1;
  invertY = false;
  private current = ZOOM.initial;

  constructor(readonly camera: THREE.PerspectiveCamera) {}

  rotate(dxPx: number, dyPx: number) {
    const k = RAD_PER_PX * this.sensitivity;
    this.yaw -= dxPx * k;
    this.pitch = clampPitch(this.pitch + dyPx * k * (this.invertY ? -1 : 1));
  }

  zoomBy(steps: number) {
    if (this.firstPerson || !steps) return; // FR-05 3a
    this.distance = THREE.MathUtils.clamp(this.distance + steps * ZOOM.step, ZOOM.min, ZOOM.max);
  }

  /** Hướng "phía trước" của camera trên mặt phẳng ngang (dùng cho WASD). */
  forward(target = new THREE.Vector3()) {
    return target.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
  }

  update(feet: THREE.Vector3, bvh: MeshBVH, dt: number) {
    orbitDir(this.yaw, this.pitch, dir);
    if (this.firstPerson) {
      this.camera.position.set(feet.x, feet.y + EYE, feet.z);
      this.camera.lookAt(pivot.copy(this.camera.position).sub(dir));
      return;
    }

    pivot.set(feet.x, feet.y + PIVOT, feet.z);
    // Có vật cản giữa đầu nhân vật và camera: kéo camera ra trước điểm chạm 0,2 m (FR-05 2a).
    ray.set(pivot, dir);
    const hit = bvh.raycastFirst(ray, THREE.DoubleSide, 0, this.distance + 0.2);
    let allowed = hit ? Math.max(0.2, hit.distance - 0.2) : this.distance;
    // Sàn phẳng y = 0 không nằm trong collider: giữ camera cao hơn sàn 0,2 m khi nhìn từ dưới lên.
    if (dir.y < 0) allowed = Math.min(allowed, (PIVOT - 0.2) / -dir.y);
    // Thu vào ngay để không nhìn xuyên tường; giãn ra có damping.
    this.current = allowed < this.current ? allowed : THREE.MathUtils.damp(this.current, allowed, 6, dt);

    this.camera.position.copy(pivot).addScaledVector(dir, this.current);
    this.camera.lookAt(pivot);
  }
}
