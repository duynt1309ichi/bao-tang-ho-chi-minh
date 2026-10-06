import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import './ui/tokens.css';
import './ui/base.css';
import { exhibit, exhibits, quiz, roomNo, rooms } from './content';
import type { AreaId, RoomId } from './content/types';
import { stepsFor } from './core/loop';
import { pickTarget } from './exhibits/proximity';
import { CameraFly, FollowCamera } from './player/camera';
import { DesktopInput } from './player/input';
import { Player } from './player/player';
import { kv } from './storage/kv';
import { ProgressStore } from './storage/progress';
import { showCompletion } from './ui/completion';
import { createToasts, h, overlayOpen, reducedMotion } from './ui/dom';
import { showExhibitPanel } from './ui/exhibitPanel';
import { showQuizPanel } from './ui/quizPanel';
import { buildBlockout } from './world/blockout';
import { areaAt, areaName, layout } from './world/layout';

// Mốc M2: hiện vật, bảng thông tin, tiến độ + lưu, trắc nghiệm trên nền blockout M1.
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const ui = document.querySelector<HTMLDivElement>('#ui')!;

if (!document.createElement('canvas').getContext('webgl2')) {
  ui.replaceChildren(
    h('div', { class: 'panel panel-center' },
      h('h1', {}, 'Không hỗ trợ WebGL2'),
      h('p', {}, 'Trình duyệt hoặc máy của bạn không hỗ trợ WebGL2 nên không chạy được bảo tàng 3D. Hãy mở bằng Chrome hoặc Edge bản mới nhất.'),
    ),
  );
} else {
  start();
}

type Target = { id: string; x: number; z: number; room?: RoomId };

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  canvas.tabIndex = -1;

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
  const fly = new CameraFly();
  const player = new Player();
  scene.add(player.object);
  player.teleport(layout.spawns.courtyard);
  follow.yaw = player.object.rotation.y + Math.PI; // camera ở sau lưng

  // Tiến độ (FR-15, FR-19).
  const content = {
    exhibitIds: new Set(exhibits.map((e) => e.id)),
    quizTotals: Object.fromEntries(rooms.map((r) => [r.id, quiz.filter((q) => q.room === r.id).length])),
  };
  const { store: progress, status } = ProgressStore.load(content);
  const total = exhibits.length;

  // HUD (SCR-05).
  const areaLabel = h('div', { class: 'hud-area' });
  const bar = h('progress', { max: String(total), value: '0', 'aria-label': 'Tiến độ khám phá' });
  const count = h('span');
  const hud = h('div', { class: 'hud' }, areaLabel, h('div', { class: 'hud-progress' }, bar, count));
  const prompt = h('div', { class: 'hud-prompt', hidden: '' });
  const hint = h('div', { class: 'hud-hint' }, 'Bấm vào màn hình để điều khiển camera · WASD: đi · Shift: chạy · E: xem · Cuộn: zoom · V: đổi góc nhìn');
  ui.replaceChildren(hud, h('div', { class: 'hud-bottom' }, prompt, hint));
  const toast = createToasts(ui);

  let warnedStorage = false;
  const renderProgress = () => {
    bar.value = progress.exploredCount;
    count.textContent = `${progress.exploredCount}/${total}`;
    if (kv.failed && !warnedStorage) {
      warnedStorage = true;
      toast('Trình duyệt đang chặn lưu trữ nên tiến độ sẽ mất khi đóng trang.', 'warn');
    }
  };
  progress.onChange = renderProgress;
  renderProgress();
  if (status === 'reset') toast('Không đọc được tiến độ cũ nên bảo tàng bắt đầu lại từ đầu.', 'warn');

  // Mục tiêu tương tác: hiện vật và trạm trắc nghiệm (BR-S09).
  const targets: Target[] = [
    ...layout.exhibits.map((p) => ({ id: p.id, x: p.pos[0], z: p.pos[2] })),
    ...layout.quizStations.map((s) => ({ id: `quiz:${s.room}`, x: s.pos[0], z: s.pos[2], room: s.room })),
  ];
  const highlight = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.1, 1.7, 1.1)).translate(0, 0.85, 0),
    new THREE.LineBasicMaterial({ color: '#d9b26a', transparent: true }),
  );
  highlight.visible = false;
  scene.add(highlight);
  let target: Target | null = null;

  // Đang xem hiện vật: camera đứng ở viewpoint, khung 3D lệch sang trái/lên trên nhường chỗ cho bảng.
  let viewing: { pos: THREE.Vector3; look: THREE.Vector3 } | null = null;
  const flyTime = (s: number) => (reducedMotion() ? 0 : s);

  const input = new DesktopInput(canvas);
  input.onToggleView = () => {
    follow.firstPerson = !follow.firstPerson;
    player.visible = !follow.firstPerson;
  };
  input.onInteract = () => {
    if (!target || overlayOpen()) return;
    input.enabled = false;
    if (target.room) {
      showQuizPanel(ui, target.room, progress, resume);
      return;
    }
    const e = exhibit(target.id)!;
    const place = layout.exhibits.find((p) => p.id === e.id)!;
    viewing = { pos: new THREE.Vector3(...place.viewpoint.pos), look: new THREE.Vector3(...place.viewpoint.target) };
    player.visible = false;
    fly.start(camera, flyTime(0.8));
    const isNew = progress.markExplored(e.id); // BR-S01: tính ngay khi mở
    showExhibitPanel(ui, e, () => {
      viewing = null;
      player.visible = !follow.firstPerson;
      fly.start(camera, flyTime(0.5));
      resume();
      if (!isNew) return;
      toast(`Đã khám phá: ${e.title} (${progress.exploredCount}/${total})`);
      if (progress.exploredCount === total && !progress.value.completedShown) {
        progress.setCompletedShown();
        input.enabled = false;
        showCompletion(ui, total, () => (player.teleport(layout.spawns['review-door']), resume()), resume);
      }
    });
  };
  function resume() {
    input.enabled = !overlayOpen();
  }

  // Móc kiểm thử tay trong dev (không có trong bản build).
  if (import.meta.env.DEV) Object.assign(window, { __museum: { player, follow, bvh, progress } });

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
    const playing = !overlayOpen();
    const { dx, dy, zoom } = input.consume();
    follow.rotate(dx, dy);
    follow.zoomBy(zoom);
    hint.hidden = input.locked || !playing;
    hud.hidden = !playing;

    const elapsed = (now - last) / 1000;
    for (const dt of stepsFor(elapsed)) {
      if (playing) {
        follow.forward(forward);
        const faceYaw = follow.firstPerson ? follow.yaw + Math.PI : undefined;
        const fell = player.update(dt, input.move, input.run, forward, bvh, faceYaw);
        const here = areaAt(layout.areas, player.feet.x, player.feet.z);
        if (fell || !here) {
          player.teleport(layout.spawns.lobby);
          toast('Đã đưa bạn về sảnh.');
        }
      }
    }
    last = now;

    if (viewing) {
      camera.position.copy(viewing.pos);
      camera.lookAt(viewing.look);
      const wide = innerWidth >= 768;
      camera.setViewOffset(innerWidth, innerHeight, wide ? 240 : 0, wide ? 0 : innerHeight * 0.3, innerWidth, innerHeight);
    } else {
      follow.update(player.feet, bvh, Math.min(elapsed, 0.1));
      if (camera.view?.enabled) camera.clearViewOffset();
    }
    fly.apply(camera, Math.min(elapsed, 0.1));

    target = playing ? pickTarget(player.feet.x, player.feet.z, player.object.rotation.y, targets) : null;
    highlight.visible = Boolean(target);
    prompt.hidden = !target;
    if (target) {
      highlight.position.set(target.x, 0, target.z);
      highlight.material.opacity = reducedMotion() ? 1 : 0.65 + 0.35 * Math.sin((now / 1500) * Math.PI * 2);
      const label = target.room ? `Trắc nghiệm ${roomNo(target.room)}` : `Xem ${exhibit(target.id)!.title}${progress.isExplored(target.id) ? ' ✓' : ''}`;
      if (prompt.dataset.label !== label) {
        prompt.dataset.label = label;
        prompt.replaceChildren(h('kbd', {}, 'E'), label);
      }
    }

    const here = areaAt(layout.areas, player.feet.x, player.feet.z);
    if (here && here !== area) {
      area = here;
      areaLabel.textContent = areaName(here);
    }
    renderer.render(scene, camera);
  });
}
