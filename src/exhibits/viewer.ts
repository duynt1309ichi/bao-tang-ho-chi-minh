import * as THREE from 'three';

/** Góc nghiêng dọc tối đa của mô hình 🧊 (FR-13 2a: dọc trong [−30°, +30°]). */
export const MODEL_PITCH_MAX = Math.PI / 6;
const RAD_PER_PX = 0.01;

/** Kẹp góc nghiêng dọc của mô hình. Hàm thuần. */
export const clampModelPitch = (p: number) => Math.max(-MODEL_PITCH_MAX, Math.min(MODEL_PITCH_MAX, p));

export interface ModelRotator {
  /** Kéo `dx`, `dy` px: ngang quay quanh trục đứng của mô hình (360°), kéo lên thì nghiêng về +30°. */
  rotate(dx: number, dy: number): void;
  /** "Đặt lại góc": về hướng ban đầu trên bục. */
  reset(): void;
  readonly pitch: number;
}

/** Xoay mô hình 🧊 trên bục khi đang xem (FR-13 2a). Gọi `reset()` khi đóng bảng để bục trở lại như cũ. */
export function modelRotator(mesh: THREE.Object3D): ModelRotator {
  const base = mesh.quaternion.clone();
  const qx = new THREE.Quaternion();
  const qy = new THREE.Quaternion();
  const X = new THREE.Vector3(1, 0, 0);
  const Y = new THREE.Vector3(0, 1, 0);
  let yaw = 0;
  let pitch = 0;
  // Nghiêng quanh trục ngang của bục (hướng về người xem), sau đó quay quanh trục đứng của chính mô hình.
  const apply = () => mesh.quaternion.copy(base).multiply(qx.setFromAxisAngle(X, pitch)).multiply(qy.setFromAxisAngle(Y, yaw));
  return {
    rotate(dx, dy) {
      yaw += dx * RAD_PER_PX;
      pitch = clampModelPitch(pitch - dy * RAD_PER_PX);
      apply();
    },
    reset() {
      yaw = pitch = 0;
      apply();
    },
    get pitch() {
      return pitch;
    },
  };
}
