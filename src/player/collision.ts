import * as THREE from 'three';
import type { MeshBVH } from 'three-mesh-bvh';

export const CAPSULE = { radius: 0.3, height: 1.7 };

const segment = new THREE.Line3();
const box = new THREE.Box3();
const triPoint = new THREE.Vector3();
const capPoint = new THREE.Vector3();
const push = new THREE.Vector3();

/**
 * Đẩy thân nhân vật (viên nang 0,3 × 1,7 m, chân tại `feet`) ra khỏi tường và bục (FR-07).
 * Chỉ đẩy theo phương ngang vì sàn phẳng y = 0 và không có nhảy. Sửa `feet` tại chỗ.
 */
export function resolveCapsule(feet: THREE.Vector3, bvh: MeshBVH, r = CAPSULE.radius, h = CAPSULE.height) {
  segment.start.set(feet.x, feet.y + r + 0.05, feet.z);
  segment.end.set(feet.x, feet.y + h - r, feet.z);
  box.makeEmpty().expandByPoint(segment.start).expandByPoint(segment.end);
  box.min.addScalar(-r);
  box.max.addScalar(r);

  bvh.shapecast({
    intersectsBounds: (b) => b.intersectsBox(box),
    intersectsTriangle: (tri) => {
      const dist = tri.closestPointToSegment(segment, triPoint, capPoint);
      if (dist < r) {
        push.subVectors(capPoint, triPoint).setY(0);
        // Trục viên nang nằm đúng trên tam giác: đẩy theo pháp tuyến ngang của tam giác.
        if (push.lengthSq() < 1e-10) tri.getNormal(push).setY(0);
        if (push.lengthSq() < 1e-10) return;
        push.normalize().multiplyScalar(r - dist);
        segment.start.add(push);
        segment.end.add(push);
      }
    },
  });

  feet.x = segment.start.x;
  feet.z = segment.start.z;
  return feet;
}
