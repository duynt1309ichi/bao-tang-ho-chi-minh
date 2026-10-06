import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Spot } from './geometry';

// Trời: HDRI Poly Haven "kloofendal_48d_partly_cloudy_puresky" (CC0), đổi sang ảnh LDR 2048 × 1024
// (tools/blender/convert_assets.py) — giữ trong dải LDR để bloom chỉ bắt đèn. Xoay 180° để nắng chiếu
// vào mặt tiền; Blender bake xoay cùng góc (tools/blender/bake_lightmap.py) nên bóng nắng khớp.
const SKY_ROTATION = Math.PI;
/** Hướng tới mặt trời trong ảnh trời sau khi xoay (đo trên ảnh: cao ~49°). */
const SUN_DIR = new THREE.Vector3(-0.56, 0.75, -0.35).normalize();
const SHADOW_HALF = 12; // vùng đổ bóng 24 × 24 m quanh người chơi
const LIGHT_DIST = 20;
const SPOT_RANGE = 6; // đèn rọi đổ bóng chỉ bật khi người chơi cách chóa ≤ 6 m
const SPOT_INTENSITY = 12;
const NIGHT_FOG = '#0b1426';

/**
 * Ánh sáng runtime. Kiến trúc tĩnh đã có lightmap bake (ánh sáng trực tiếp + gián tiếp); đèn ở đây
 * chủ yếu chiếu nhân vật, khối cong và tạo bóng động (HLD 7.3):
 * - đèn hướng theo nắng, vùng bóng đi theo người chơi (TB: map 1024; Cao: 2048);
 * - mức Cao thêm một đèn rọi 3200 K đổ bóng, đặt ở chóa gần người chơi nhất.
 * IBL trung tính từ RoomEnvironment cho vật thể động.
 */
export function setupEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer, light: THREE.DirectionalLight, spot: THREE.SpotLight, spots: Spot[]) {
  scene.background = new THREE.Color('#9cc2e4');
  new THREE.TextureLoader().load('/assets/sky.webp', (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
  });
  scene.backgroundRotation.y = SKY_ROTATION;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  light.color.set('#fff1dc');
  light.intensity = 0.6;
  const s = light.shadow;
  s.camera.left = s.camera.bottom = -SHADOW_HALF;
  s.camera.right = s.camera.top = SHADOW_HALF;
  s.camera.near = 1;
  s.camera.far = LIGHT_DIST * 2;
  s.bias = -0.0008;
  s.normalBias = 0.05;
  s.radius = 3;
  scene.add(light, light.target);

  spot.color.set('#ffb86b'); // ~3200 K
  spot.intensity = 0;
  spot.angle = THREE.MathUtils.degToRad(21);
  spot.penumbra = 0.5;
  spot.decay = 2;
  spot.distance = 8;
  spot.shadow.bias = -0.0005;
  spot.shadow.normalBias = 0.03;
  spot.shadow.camera.near = 0.3;
  scene.add(spot, spot.target);

  // Sương chỉ dày lên ban đêm (FR-23); ban ngày đẩy ra rất xa nên coi như không có.
  const fog = new THREE.Fog(NIGHT_FOG, 1e4, 2e4);
  scene.fog = fog;
  const DAY_SUN = new THREE.Color('#fff1dc'), MOON = new THREE.Color('#9fb4ff');

  const texel = (SHADOW_HALF * 2) / 1024;
  let current: Spot | null = null;
  let night = 0, indoor = 0;
  const applySun = () => {
    // Trong nhà có trần: nắng/trăng chỉ còn đủ tạo bóng mờ (lightmap đã có ánh sáng), tránh lóa trên sàn gỗ.
    light.intensity = THREE.MathUtils.lerp(0.6, 0.15, night) * THREE.MathUtils.lerp(1, 0.2, indoor);
    // Đêm chỉ tối ngoài trời; trong nhà đèn vẫn bật nên vật thể động giữ IBL gần như ban ngày.
    scene.environmentIntensity = THREE.MathUtils.lerp(0.5, THREE.MathUtils.lerp(0.08, 0.45, indoor), night);
  };
  return {
    /** Người chơi đang trong nhà (1) hay ngoài khuôn viên (0); gọi mỗi khung, tự làm mượt. */
    setIndoor(target: boolean, dt: number) {
      indoor += ((target ? 1 : 0) - indoor) * Math.min(1, dt * 3);
      applySun();
    },
    /** 0 = ngày, 1 = đêm; gọi mỗi khung trong lúc chuyển (≤ 2 s). */
    setNight(k: number) {
      night = k;
      scene.backgroundIntensity = THREE.MathUtils.lerp(1, 0.05, k);
      applySun();
      light.color.lerpColors(DAY_SUN, MOON, k);
      fog.near = THREE.MathUtils.lerp(1e4, 25, k);
      fog.far = THREE.MathUtils.lerp(2e4, 140, k);
    },
    /** Đặt vùng bóng quanh người chơi; làm tròn theo texel để bóng không rung. Chọn chóa đèn rọi gần nhất. */
    follow(feet: THREE.Vector3, dt: number) {
      const x = Math.round(feet.x / texel) * texel;
      const z = Math.round(feet.z / texel) * texel;
      light.target.position.set(x, 0, z);
      light.position.set(x, 0, z).addScaledVector(SUN_DIR, LIGHT_DIST);

      if (!spot.visible) return;
      let best: Spot | null = null;
      let bestD = SPOT_RANGE;
      for (const sp of spots) {
        const d = Math.hypot(sp.pos[0] - feet.x, sp.pos[2] - feet.z);
        if (d < bestD) {
          best = sp;
          bestD = d;
        }
      }
      // Tắt dần chóa cũ rồi bật chóa mới để không giật sáng.
      const step = Math.min(1, dt * 6) * SPOT_INTENSITY;
      if (best !== current) {
        spot.intensity = Math.max(0, spot.intensity - step);
        if (spot.intensity > 0) return;
        current = best;
        if (best) {
          spot.position.set(...best.pos);
          spot.target.position.set(...best.target);
        }
      } else if (current) spot.intensity = Math.min(SPOT_INTENSITY, spot.intensity + step);
    },
  };
}
