import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import './ui/tokens.css';
import './ui/base.css';
import type { AreaId } from './content/types';
import { stepsFor } from './core/loop';
import { FollowCamera } from './player/camera';
import { DesktopInput } from './player/input';
import { Player } from './player/player';
import { buildBlockout } from './world/blockout';
import { areaAt, areaName, layout } from './world/layout';

// Mốc M1: bảo tàng dạng khối hộp, nhân vật tạm, camera thứ 3, va chạm.
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const ui = document.querySelector<HTMLDivElement>('#ui')!;

function el(tag: string, className: string, text = '') {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

if (!document.createElement('canvas').getContext('webgl2')) {
  const panel = el('div', 'panel');
  panel.append(
    el('h1', '', 'Không hỗ trợ WebGL2'),
    el('p', '', 'Trình duyệt hoặc máy của bạn không hỗ trợ WebGL2 nên không chạy được bảo tàng 3D. Hãy mở bằng Chrome hoặc Edge bản mới nhất.'),
  );
  ui.replaceChildren(panel);
} else {
  start();
}

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#a9c4d8');
  scene.fog = new THREE.Fog('#a9c4d8', 40, 120);
  scene.add(new THREE.HemisphereLight('#f3eee4', '#5a5040', 1.6));
  const sun = new THREE.DirectionalLight('#fff4e0', 1.6);
  sun.position.set(-20, 40, 15);
  scene.add(sun);

  const { group, collider } = buildBlockout(layout);
  scene.add(group);
  const bvh = new MeshBVH(collider);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 200);
  const follow = new FollowCamera(camera);
  const player = new Player();
  scene.add(player.object);
  player.teleport(layout.spawns.courtyard);
  follow.yaw = player.object.rotation.y + Math.PI; // camera ở sau lưng

  const input = new DesktopInput(canvas);
  input.onToggleView = () => {
    follow.firstPerson = !follow.firstPerson;
    player.visible = !follow.firstPerson;
  };

  const areaLabel = el('div', 'hud-area');
  const toast = el('div', 'toast');
  toast.setAttribute('role', 'status');
  const hint = el('div', 'hud-hint', 'Bấm vào màn hình để điều khiển camera · WASD: đi · Shift: chạy · Cuộn: zoom · V: đổi góc nhìn');
  ui.replaceChildren(areaLabel, hint, toast);
  let toastTimer = 0;
  const showToast = (text: string) => {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // Móc kiểm thử tay trong dev (không có trong bản build).
  if (import.meta.env.DEV) Object.assign(window, { __museum: { player, follow, bvh } });

  let area: AreaId | null = null;
  const forward = new THREE.Vector3();

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();

  let last = performance.now();
  renderer.setAnimationLoop((now) => {
    const { dx, dy, zoom } = input.consume();
    follow.rotate(dx, dy);
    follow.zoomBy(zoom);
    hint.hidden = input.locked;

    for (const dt of stepsFor((now - last) / 1000)) {
      follow.forward(forward);
      const faceYaw = follow.firstPerson ? follow.yaw + Math.PI : undefined;
      const fell = player.update(dt, input.move, input.run, forward, bvh, faceYaw);
      const here = areaAt(layout.areas, player.feet.x, player.feet.z);
      if (fell || !here) {
        player.teleport(layout.spawns.lobby);
        showToast('Đã đưa bạn về sảnh.');
      }
      follow.update(player.feet, bvh, dt);
    }
    last = now;

    const here = areaAt(layout.areas, player.feet.x, player.feet.z);
    if (here && here !== area) {
      area = here;
      areaLabel.textContent = areaName(here);
    }
    renderer.render(scene, camera);
  });
}
