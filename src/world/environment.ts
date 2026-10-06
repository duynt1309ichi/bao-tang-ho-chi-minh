import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const SUN_DIR = new THREE.Vector3(-0.45, 0.8, 0.35).normalize();
const SHADOW_HALF = 12; // vùng đổ bóng 24 × 24 m quanh người chơi
const LIGHT_DIST = 20;

/**
 * Bầu trời gradient + ánh sáng môi trường (IBL) từ RoomEnvironment — thay HDRI tải về, không tốn băng thông.
 * Trời giữ trong dải LDR để bloom (ngưỡng 1,6) chỉ bắt đèn trần, không loang trời ra khắp cảnh.
 * Một đèn hướng đổ bóng đi theo người chơi (HLD 7.3: "1 đèn gần người chơi"); trần nhà không chắn đèn này
 * nên trong phòng vẫn có bóng của bục, nhân vật.
 * ponytail: chưa có lightmap bake (Blender) — thêm nếu ảnh chụp các phòng còn phẳng sau khi nghiệm thu M3.
 */
export function setupEnvironment(scene: THREE.Scene, renderer: THREE.WebGLRenderer, light: THREE.DirectionalLight) {
  scene.background = skyGradient();

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight('#fff6e8', '#6b5e4a', 0.5));

  light.color.set('#fff1dc');
  light.intensity = 1.3;
  const s = light.shadow;
  s.camera.left = s.camera.bottom = -SHADOW_HALF;
  s.camera.right = s.camera.top = SHADOW_HALF;
  s.camera.near = 1;
  s.camera.far = LIGHT_DIST * 2;
  s.bias = -0.0008;
  s.normalBias = 0.05;
  s.radius = 3;
  scene.add(light, light.target);

  const texel = (SHADOW_HALF * 2) / 1024;
  return {
    light,
    /** Đặt vùng đổ bóng quanh người chơi; làm tròn theo texel để bóng không rung khi đi. */
    follow(feet: THREE.Vector3) {
      const x = Math.round(feet.x / texel) * texel;
      const z = Math.round(feet.z / texel) * texel;
      light.target.position.set(x, 0, z);
      light.position.set(x, 0, z).addScaledVector(SUN_DIR, LIGHT_DIST);
    },
  };
}

/** Nền trời equirect: xanh đậm trên đỉnh, nhạt dần về chân trời. */
function skyGradient() {
  const c = Object.assign(document.createElement('canvas'), { width: 4, height: 256 });
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#3f78bf');
  g.addColorStop(0.42, '#9cc2e4');
  g.addColorStop(0.5, '#dbe8f0');
  g.addColorStop(0.52, '#b9c4c4');
  g.addColorStop(1, '#8c9488');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
