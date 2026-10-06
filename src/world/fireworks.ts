import * as THREE from 'three';
import { audio } from '../audio';

// Pháo hoa ban đêm trên khuôn viên (SRS FR-23). Một đối tượng Points dùng lại bộ đệm cố định.
// Không có chớp sáng toàn màn hình (NFR-08): chỉ là hạt sáng nhỏ trên trời.

const CAPACITY = 4000;
const PER_BURST = 300; // mức Cao; HLD 7.3: TB 60 %, Thấp 25 %
const COLORS = ['#ffd27a', '#ff6b6b', '#7ad1ff', '#b88cff', '#9dff8a', '#ffffff'].map((c) => new THREE.Color(c));
/** Vùng bắn: trên khuôn viên, cao 18–28 m. */
const AREA = { x: [-40, -18], y: [18, 28], z: [-12, 12] } as const;

/** Thời điểm nổ tiếp theo (giây) sau một lần nổ — 0,9 đến 1,9 s. Hàm thuần (nhận số ngẫu nhiên). */
export const nextBurstIn = (r: number) => 0.9 + r;

export function createFireworks(scene: THREE.Scene) {
  const pos = new Float32Array(CAPACITY * 3);
  const col = new Float32Array(CAPACITY * 3);
  const vel = new Float32Array(CAPACITY * 3);
  const life = new Float32Array(CAPACITY); // giây còn lại
  const base = new Float32Array(CAPACITY * 3); // màu gốc
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  const sprite = (() => {
    const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 });
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.3, 'rgba(255,255,255,.6)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.7, map: sprite, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  points.frustumCulled = false;
  points.visible = false;
  scene.add(points);

  let cursor = 0, timer = 1, pending: { at: number; x: number; y: number; z: number } | null = null;
  let density = 1;
  return {
    /** Tỉ lệ hạt theo mức chất lượng (1 / 0,6 / 0,25). */
    set density(d: number) {
      density = d;
    },
    /** `active` = đang là đêm; `listener` = vị trí người chơi để chỉnh âm lượng tiếng nổ. */
    update(dt: number, active: boolean, listener: THREE.Vector3) {
      timer -= dt;
      if (active && timer <= 0 && !pending) {
        const rx = (a: readonly [number, number]) => a[0] + Math.random() * (a[1] - a[0]);
        pending = { at: 0.7, x: rx(AREA.x), y: rx(AREA.y), z: rx(AREA.z) };
        const d = Math.hypot(listener.x - pending.x, listener.z - pending.z);
        audio.play('firework', Math.max(0.15, Math.min(1, 25 / Math.max(d, 1)) * (listener.x < -14 ? 1 : 0.4)));
        timer = nextBurstIn(Math.random());
      }
      if (pending && (pending.at -= dt) <= 0) {
        const n = Math.round(PER_BURST * density);
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        for (let k = 0; k < n; k++) {
          const i = cursor;
          cursor = (cursor + 1) % CAPACITY;
          const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), sp = 7 + Math.random() * 3;
          pos.set([pending.x, pending.y, pending.z], i * 3);
          vel.set([s * Math.cos(th) * sp, u * sp, s * Math.sin(th) * sp], i * 3);
          base.set([c.r, c.g, c.b], i * 3);
          life[i] = 1.6 + Math.random() * 0.6;
        }
        pending = null;
      }
      let alive = false;
      for (let i = 0; i < CAPACITY; i++) {
        if (life[i] <= 0) continue;
        life[i] -= dt;
        const a = Math.max(0, Math.min(1, life[i] / 1.2));
        alive ||= a > 0;
        const j = i * 3;
        vel[j + 1] -= 4 * dt;
        for (let k = 0; k < 3; k++) {
          vel[j + k] *= 1 - 1.2 * dt;
          pos[j + k] += vel[j + k] * dt;
          col[j + k] = base[j + k] * a;
        }
      }
      points.visible = alive;
      if (alive) {
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
      }
    },
  };
}
