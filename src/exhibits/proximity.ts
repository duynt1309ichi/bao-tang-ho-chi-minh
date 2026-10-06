export interface Candidate {
  id: string;
  x: number;
  z: number;
}

/**
 * Chọn mục tiêu tương tác theo BR-S09: khoảng cách ngang ≤ `maxDist` và lệch so với hướng nhìn
 * ≤ `maxAngleDeg`; nhiều cái thỏa thì lấy cái gần nhất. `facingYaw` theo quy ước của Player:
 * hướng nhìn = (sin yaw, cos yaw) trên mặt phẳng xz. Hàm thuần.
 */
export function pickTarget<T extends Candidate>(x: number, z: number, facingYaw: number, candidates: readonly T[], maxDist = 2, maxAngleDeg = 60): T | null {
  const fx = Math.sin(facingYaw);
  const fz = Math.cos(facingYaw);
  const minCos = Math.cos((maxAngleDeg * Math.PI) / 180);
  let best: T | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const dx = c.x - x;
    const dz = c.z - z;
    const dist = Math.hypot(dx, dz);
    if (dist > maxDist || dist >= bestDist) continue;
    if (dist > 1e-6 && (dx * fx + dz * fz) / dist < minCos) continue;
    best = c;
    bestDist = dist;
  }
  return best;
}
