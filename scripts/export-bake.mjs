// Xuất hình học bảo tàng + đèn cho Blender bake lightmap: node scripts/export-bake.mjs
// Dùng chung code TS với runtime (src/world/geometry.ts) qua Vite, nên UV lightmap khớp tuyệt đối.
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
try {
  const { exportBake } = await server.ssrLoadModule('/scripts/bake-scene.ts');
  exportBake();
} finally {
  await server.close();
}
