import * as THREE from 'three';
import './ui/tokens.css';
import './ui/base.css';

// Khung dự án (scaffold B3): kiểm WebGL2 và vẽ một cảnh mẫu để làm healthcheck.
const canvas = document.querySelector<HTMLCanvasElement>('#scene')!;
const ui = document.querySelector<HTMLDivElement>('#ui')!;

function panel(kicker: string, title: string, body: string) {
  const el = document.createElement('div');
  el.className = 'panel';
  for (const [tag, cls, text] of [['p', 'kicker', kicker], ['h1', '', title], ['p', '', body]]) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    node.textContent = text;
    el.append(node);
  }
  ui.replaceChildren(el);
}

if (!document.createElement('canvas').getContext('webgl2')) {
  panel(
    'BẢO TÀNG TRIẾT HỌC',
    'Không hỗ trợ WebGL2',
    'Trình duyệt hoặc máy của bạn không hỗ trợ WebGL2 nên không chạy được bảo tàng 3D. Hãy mở bằng Chrome hoặc Edge bản mới nhất.',
  );
} else {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1b1d24');
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight('#f3eee4', '#2a2620', 1.2));
  const sun = new THREE.DirectionalLight('#ffffff', 2);
  sun.position.set(4, 8, 3);
  scene.add(sun);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: '#e9e3d6' }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Ba bục theo màu ba khu (design.md mục 2).
  ['#7a1f2b', '#1f3a6b', '#a87a2a'].forEach((color, i) => {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1, 1.2, 1), new THREE.MeshStandardMaterial({ color }));
    plinth.position.set((i - 1) * 2, 0.6, 0);
    scene.add(plinth);
  });

  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();

  renderer.setAnimationLoop((t) => {
    const a = t / 6000;
    camera.position.set(Math.sin(a) * 7, 3.5, Math.cos(a) * 7);
    camera.lookAt(0, 0.8, 0);
    renderer.render(scene, camera);
  });

  panel('BẢO TÀNG SỐ · KHÔNG GIAN 3D', 'Bảo tàng Triết học', 'Khung dự án đang chạy (WebGL2 OK).');
}
