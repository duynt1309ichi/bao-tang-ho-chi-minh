import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/400-italic.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import './ui/tokens.css';
import './ui/base.css';
import { audio } from './audio';
import { exhibit, exhibits, quiz, roomNo, rooms } from './content';
import type { AreaId, RoomId } from './content/types';
import { Graphics } from './core/graphics';
import { initialAssets, loadBundle } from './core/loader';
import { stepsFor } from './core/loop';
import { FpsMonitor, lower, PRESETS, QUALITY_LABEL, type Quality } from './core/quality';
import { pickTarget } from './exhibits/proximity';
import { hints } from './quiz/session';
import { CameraFly, FollowCamera } from './player/camera';
import { loadCharacter, type CharacterId } from './player/character';
import { DesktopInput } from './player/input';
import { Player } from './player/player';
import { TouchInput } from './player/touch';
import { kv } from './storage/kv';
import { ProgressStore } from './storage/progress';
import { clampSensitivity, SettingsStore } from './storage/settings';
import { showCompletion } from './ui/completion';
import { createToasts, h, overlayOpen, reducedMotion } from './ui/dom';
import { createMinimap } from './ui/minimap';
import { showExhibitPanel } from './ui/exhibitPanel';
import { showPauseMenu } from './ui/pauseMenu';
import { showQuizPanel } from './ui/quizPanel';
import { createRotateHint, showCharacterSelect, showLoading, showMessageScreen, showTitle, watchContextLoss } from './ui/screens';
import { showTutorial } from './ui/tutorial';
import { buildBlockout } from './world/blockout';
import { setupEnvironment } from './world/environment';
import { createFireworks } from './world/fireworks';
import { areaAt, areaName, layout } from './world/layout';

// Mốc M5: màn tải / mở đầu / chọn nhân vật, nhân vật có hoạt ảnh, điều khiển cảm ứng — trên nền M1–M4.
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const ui = document.querySelector<HTMLDivElement>('#ui')!;

if (!document.createElement('canvas').getContext('webgl2')) {
  showMessageScreen(ui, 'Không hỗ trợ WebGL2', 'Trình duyệt hoặc máy của bạn không hỗ trợ WebGL2 nên không chạy được bảo tàng 3D. Hãy mở bằng Chrome hoặc Edge bản mới nhất.');
} else {
  start();
}

type Target = { id: string; x: number; z: number; room?: RoomId };
/** Cảnh nền đang hiện: màn mở đầu (camera bay vòng), chọn nhân vật (camera nhìn mặt nhân vật), hoặc đang chơi. */
type Mode = 'title' | 'select' | 'play';

async function start() {
  canvas.tabIndex = -1;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const settings = SettingsStore.load(isTouch);
  // SCR-01 hiện ngay, trước khi dựng cảnh (vẽ atlas chữ mất vài trăm ms).
  const loading = showLoading(ui);
  watchContextLoss(canvas, ui);
  await new Promise((r) => (requestAnimationFrame(r), setTimeout(r, 100))); // tab ẩn thì rAF không chạy

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 200);
  const sun = new THREE.DirectionalLight();
  const spot = new THREE.SpotLight();
  const gfx = new Graphics(canvas, scene, camera, sun, spot);
  const museum = buildBlockout(layout);
  const { collider } = museum;
  scene.add(museum.group);
  const env = setupEnvironment(scene, gfx.renderer, sun, spot, museum.spots);
  const fireworks = createFireworks(scene);
  const applyQuality = (q: Quality, announce = false) => {
    gfx.apply(q);
    fireworks.density = PRESETS[q].fireworks;
    const textures = museum.setTextureSize(PRESETS[q].texture);
    if (announce && PRESETS[q].texture === '2k') {
      toast('Đang tải texture chất lượng cao…');
      textures.then(() => toast('Đã tải xong texture chất lượng cao.'));
    }
    textures.catch((e) => console.error('Không tải được texture', e));
    return textures;
  };
  const bvh = new MeshBVH(collider);

  const follow = new FollowCamera(camera);
  follow.sensitivity = settings.value.sensitivity;
  follow.invertY = settings.value.invertY;
  const fly = new CameraFly();
  const player = new Player();
  scene.add(player.object);

  // Tiến độ (FR-15, FR-19) — đọc trước khi tải để biết nhân vật nào nằm trong gói ban đầu.
  const content = {
    exhibitIds: new Set(exhibits.map((e) => e.id)),
    quizTotals: Object.fromEntries(rooms.map((r) => [r.id, quiz.filter((q) => q.room === r.id).length])),
  };
  const { store: progress, status } = ProgressStore.load(content);
  const total = exhibits.length;
  const returning = progress.exploredCount > 0 || Boolean(progress.value.character);

  // Gói ban đầu (FR-01 bước 2, 2a): lỗi thì hiện MSG-02, "Thử lại" chỉ tải file còn thiếu.
  // Giải mã (ảnh, GLB) cũng nằm trong vòng thử lại để file hỏng hiện màn lỗi thay vì treo màn tải.
  for (;;) {
    try {
      await loadBundle(initialAssets(progress.value.character ?? 'nam'), loading.progress);
      const [first] = await Promise.all([loadCharacter(progress.value.character ?? 'nam'), museum.loadLightmap(), env.loadSky(), applyQuality(settings.value.quality)]);
      player.setCharacter(first);
      break;
    } catch (e) {
      console.error(e);
      await loading.error();
    }
  }
  player.teleport(returning ? layout.spawns.lobby : layout.spawns.courtyard); // FR-01 bước 5

  // HUD (SCR-05).
  const areaLabel = h('div', { class: 'hud-area' });
  const bar = h('progress', { max: String(total), value: '0', 'aria-label': 'Tiến độ khám phá' });
  const count = h('span');
  const hud = h('div', { class: 'hud' }, areaLabel, h('div', { class: 'hud-progress' }, bar, count));
  const prompt = h('div', { class: 'hud-prompt', hidden: '' });
  const hint = h('div', { class: 'hud-hint' }, 'Bấm vào màn hình để điều khiển camera · WASD: đi · Shift: chạy · E: xem · Cuộn: zoom · V: đổi góc nhìn · N: ngày/đêm · M: bản đồ');
  const soundBtn = h('button', { class: 'icon-btn', 'aria-label': 'Âm thanh' });
  const nightBtn = h('button', { class: 'icon-btn', 'aria-label': 'Ngày / đêm (N)' });
  const helpBtn = h('button', { class: 'icon-btn', 'aria-label': 'Hướng dẫn' }, '?');
  const fullBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toàn màn hình' }, '⛶');
  fullBtn.hidden = !document.fullscreenEnabled;
  const menuBtn = h('button', { class: 'icon-btn', 'aria-label': 'Menu' }, '☰');
  const minimap = createMinimap(layout, progress, hints);
  const hudRight = h('div', { class: 'hud-right' }, h('div', { class: 'hud-buttons' }, soundBtn, nightBtn, helpBtn, fullBtn, menuBtn), minimap.el);
  const viewBtn = h('button', { class: 'btn primary view-btn', hidden: '' }, 'Xem'); // SCR-05 element 10, chỉ cảm ứng
  loading.done();
  ui.append(hud, hudRight, h('div', { class: 'hud-bottom' }, prompt, hint), viewBtn);
  const toast = createToasts(ui);
  const rotateHint = createRotateHint(ui);

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
  const touch = new TouchInput(canvas, ui);
  document.addEventListener('gesturestart', (e) => e.preventDefault()); // Safari iOS: chụm hai ngón không phóng to trang (FR-06)
  viewBtn.addEventListener('click', () => input.onInteract());
  input.onToggleView = () => {
    follow.firstPerson = !follow.firstPerson;
    player.visible = !follow.firstPerson;
  };
  input.onInteract = () => {
    if (!target || overlayOpen()) return;
    controls(false);
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
    hints.delete(e.id); // FR-17: đã xem lại thì bỏ ◎
    showExhibitPanel(ui, e, () => {
      viewing = null;
      player.visible = !follow.firstPerson;
      fly.start(camera, flyTime(0.5));
      resume();
      if (!isNew) return;
      toast(`Đã khám phá: ${e.title} (${progress.exploredCount}/${total})`);
      if (progress.exploredCount === total && !progress.value.completedShown) {
        progress.setCompletedShown();
        controls(false);
        showCompletion(ui, total, () => (player.teleport(layout.spawns['review-door']), resume()), resume);
      }
    });
  };
  function controls(on: boolean) {
    input.enabled = touch.enabled = on;
  }
  function resume() {
    controls(!overlayOpen());
  }

  // SCR-12: nút ☰, hoặc ESC (trình duyệt nhả pointer lock trước rồi mới tới đây).
  const openMenu = () => {
    if (overlayOpen()) return;
    controls(false);
    showPauseMenu(ui, {
      settings: () => settings.value,
      setQuality: (q) => {
        settings.update({ quality: q, qualityManual: true });
        applyQuality(q, true);
      },
      setSensitivity: (v) => settings.update({ sensitivity: (follow.sensitivity = clampSensitivity(v)) }),
      setInvertY: (v) => settings.update({ invertY: (follow.invertY = v) }),
      setVolumes: (music, sfx) => {
        settings.update({ volumeMusic: music, volumeSfx: sfx });
        audio.setVolumes(music, sfx);
      },
      isTouch,
      toLobby: () => {
        player.teleport(layout.spawns.lobby);
        toast('Đã đưa bạn về sảnh.');
      },
      showCompletion: progress.exploredCount === total ? () => showCompletion(ui, total, () => (player.teleport(layout.spawns['review-door']), resume()), resume) : null,
      character: () => progress.value.character ?? 'nam',
      setCharacter: (c) => (progress.setCharacter(c), showCharacter(c)),
      // FR-20: xóa rồi tải lại trang → màn mở đầu như lần đầu (có chọn nhân vật, hướng dẫn).
      resetProgress: () => (progress.reset(), location.reload()),
      onClose: resume,
    });
  };
  menuBtn.addEventListener('click', openMenu);
  // SCR-04: nút "?" trên HUD; tự mở lần chơi đầu (FR-03).
  const openTutorial = (first: boolean) => {
    if (overlayOpen()) return;
    controls(false);
    showTutorial(ui, isTouch, () => {
      if (first) progress.setTutorialSeen();
      resume();
    });
  };
  helpBtn.addEventListener('click', () => openTutorial(false));
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== canvas) openMenu();
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !e.defaultPrevented && !overlayOpen()) openMenu(); // ESC vừa đóng một lớp thì thôi
  });

  // Âm thanh (FR-24): chỉ bật sau thao tác đầu tiên; nút loa bật/tắt toàn bộ, lưu `muted`.
  audio.setVolumes(settings.value.volumeMusic, settings.value.volumeSfx);
  audio.setMuted(settings.value.muted);
  for (const ev of ['pointerdown', 'keydown'] as const) addEventListener(ev, () => audio.unlock(), { capture: true });
  const renderSound = () => {
    soundBtn.textContent = settings.value.muted ? '🔇' : '🔊';
    soundBtn.setAttribute('aria-pressed', String(settings.value.muted));
  };
  soundBtn.addEventListener('click', () => {
    settings.update({ muted: !settings.value.muted });
    audio.setMuted(settings.value.muted);
    renderSound();
  });
  renderSound();

  // Ngày/đêm (FR-23): N hoặc nút ☀/☾; chuyển trong 1,5 s; lưu `night`.
  let nightK = settings.value.night ? 1 : 0;
  const renderNight = () => {
    nightBtn.textContent = settings.value.night ? '☾' : '☀';
    nightBtn.setAttribute('aria-pressed', String(settings.value.night));
  };
  const toggleNight = () => {
    settings.update({ night: !settings.value.night });
    renderNight();
  };
  nightBtn.addEventListener('click', toggleNight);
  renderNight();

  // Bản đồ (FR-10): bấm bản đồ nhỏ hoặc M → SCR-09.
  const openMap = () => {
    if (overlayOpen()) return;
    controls(false);
    minimap.openLarge({ x: player.feet.x, z: player.feet.z, yaw: player.object.rotation.y }, resume);
  };
  minimap.el.addEventListener('click', openMap);
  minimap.el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') openMap();
  });
  fullBtn.addEventListener('click', () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {}));
  addEventListener('keydown', (e) => {
    if (overlayOpen() || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'KeyN') toggleNight();
    if (e.code === 'KeyM') openMap();
  });

  // Tiếng bước chân theo nhịp đi/chạy, âm sắc theo mặt sàn.
  let stepTimer = 0;
  const surfaceAt = (x: number, z: number, a: AreaId | null) => {
    if (a === 'courtyard') return Math.abs(z) < 1.5 ? 'stone' : 'soft';
    const r = layout.areas.find((v) => v.id === a);
    if (!r?.zone) return 'stone';
    const [rx, rz, w, d] = r.rect;
    return x > rx + 1.5 && x < rx + w - 1.5 && z > rz + 1.5 && z < rz + d - 1.5 ? 'soft' : 'wood';
  };

  // Tự hạ chất lượng một lần mỗi phiên khi FPS < 25 trong 5 s chơi liên tục (BR-S12, MSG-09).
  const fps = new FpsMonitor();
  let downgraded = false;
  const watchFps = (elapsed: number, playing: boolean) => {
    if (downgraded || settings.value.qualityManual) return;
    if (!playing || elapsed > 0.5) return fps.reset(); // mở bảng, tab vừa hiện lại: bắt đầu đếm lại
    if (!fps.push(elapsed)) return;
    downgraded = true;
    const next = lower(settings.value.quality);
    if (!next) return;
    settings.update({ quality: next });
    applyQuality(next);
    toast(`Đã giảm chất lượng đồ họa xuống ${QUALITY_LABEL[next]} để chạy mượt hơn.`, 'warn');
  };

  // Móc kiểm thử tay trong dev (không có trong bản build).
  if (import.meta.env.DEV) Object.assign(window, { __museum: { player, follow, bvh, progress, gfx, settings, fps, audio, env, museum, fireworks } });

  let area: AreaId | null = null;
  const forward = new THREE.Vector3();

  const resize = () => {
    gfx.resize();
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();

  // Đổi mô hình nhân vật (SCR-03 xem trước, SCR-13 cài đặt); bấm đổi liên tục thì giữ lựa chọn cuối.
  let wanted: CharacterId = progress.value.character ?? 'nam';
  const showCharacter = (c: CharacterId) => {
    wanted = c;
    loadCharacter(c).then(
      (ch) => wanted === c && player.setCharacter(ch),
      () => toast('Không tải được nhân vật. Kiểm tra kết nối mạng rồi chọn lại.', 'warn'),
    );
  };

  // Luồng vào bảo tàng (FR-01 bước 4–5, FR-02, FR-03): SCR-02 → [SCR-03] → [SCR-04] → chơi.
  let mode: Mode = 'title';
  controls(false);
  if (status === 'reset') toast('Không đọc được tiến độ cũ nên bảo tàng bắt đầu lại từ đầu.', 'warn');
  const play = () => {
    mode = 'play';
    follow.yaw = player.object.rotation.y + Math.PI; // camera ở sau lưng
    fly.start(camera, flyTime(1));
    resume();
  };
  const afterCharacter = () => (progress.value.tutorialSeen ? play() : showTutorial(ui, isTouch, () => (progress.setTutorialSeen(), play())));
  showTitle(ui, { returning, explored: progress.exploredCount, total }, () => {
    if (progress.value.character) return afterCharacter();
    mode = 'select';
    fly.start(camera, flyTime(0.8));
    showCharacterSelect(ui, 'nam', showCharacter, (c) => {
      progress.setCharacter(c);
      showCharacter(c);
      afterCharacter();
    });
  });

  let last = performance.now();
  gfx.renderer.setAnimationLoop((now) => {
    const playing = !overlayOpen();
    const d = input.consume();
    const t = touch.consume();
    follow.rotate(d.dx + t.dx, d.dy + t.dy);
    follow.zoomBy(d.zoom + t.zoom);
    const byTouch = touch.move.right !== 0 || touch.move.forward !== 0;
    const move = byTouch ? touch.move : input.move;
    const run = byTouch ? touch.run : input.run;
    hint.hidden = isTouch || input.locked || !playing;
    hud.hidden = hudRight.hidden = !playing;
    rotateHint.update(isTouch && playing && innerHeight > innerWidth);

    const elapsed = (now - last) / 1000;
    for (const dt of stepsFor(elapsed)) {
      if (playing) {
        follow.forward(forward);
        const faceYaw = follow.firstPerson ? follow.yaw + Math.PI : undefined;
        const fell = player.update(dt, move, run, forward, bvh, faceYaw);
        const here = areaAt(layout.areas, player.feet.x, player.feet.z);
        if (fell || !here) {
          player.teleport(layout.spawns.lobby);
          toast('Đã đưa bạn về sảnh.');
        }
      }
    }
    last = now;

    if (mode === 'title') {
      // SCR-02: camera bay chậm qua lại trước mặt tiền bảo tàng (đứng yên nếu giảm chuyển động).
      const a = reducedMotion() ? 0.35 : Math.sin(now / 9000) * 0.6;
      camera.position.set(-14 - Math.cos(a) * 16, 3.5, Math.sin(a) * 16);
      camera.lookAt(-14, 4.5, 0);
    } else if (mode === 'select') {
      // SCR-03: nhìn thẳng vào mặt nhân vật để xem trước.
      const f = player.feet, yaw = player.object.rotation.y;
      camera.position.set(f.x + Math.sin(yaw) * 3.6, 1.5, f.z + Math.cos(yaw) * 3.6);
      camera.lookAt(f.x, 0.35, f.z); // nhìn thấp để nhân vật nằm nửa trên, không bị bảng chọn che
    } else if (viewing) {
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
    prompt.hidden = isTouch || !target;
    viewBtn.hidden = !isTouch || !target;
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
    const dt = Math.min(elapsed, 0.1);
    env.follow(player.feet, dt);
    const nightTarget = settings.value.night ? 1 : 0;
    if (nightK !== nightTarget) nightK = nightTarget > nightK ? Math.min(1, nightK + dt / 1.5) : Math.max(0, nightK - dt / 1.5);
    env.setNight(nightK);
    env.setIndoor(area !== 'courtyard', dt);
    museum.night = nightK;
    fireworks.update(dt, nightK > 0.6, player.feet);
    minimap.update(now, { x: player.feet.x, z: player.feet.z, yaw: player.object.rotation.y });
    const moving = playing && (move.right !== 0 || move.forward !== 0);
    player.character?.play(moving ? (run ? 'run' : 'walk') : 'idle');
    player.character?.update(dt);
    stepTimer = moving ? stepTimer - dt : 0;
    if (moving && stepTimer <= 0) {
      audio.footstep(surfaceAt(player.feet.x, player.feet.z, area));
      stepTimer = run ? 0.32 : 0.5;
    }
    watchFps(elapsed, playing && mode === 'play');
    gfx.render();
  });
}
