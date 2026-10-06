import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/**
 * `virtual:asset-sizes`: { "/assets/…": số byte } của mọi file trong public/assets, đọc lúc dev/build
 * nên không lệch với file thật. Dùng để tính % màn tải (FR-01) và kiểm ngân sách tải ban đầu (NFR-03).
 */
function assetSizes(): Plugin {
  const id = 'virtual:asset-sizes';
  const list = (dir: string): string[] => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? list(join(dir, f)) : [join(dir, f)]));
  return {
    name: 'asset-sizes',
    resolveId: (s) => (s === id ? `\0${id}` : undefined),
    load(s) {
      if (s !== `\0${id}`) return;
      const sizes = Object.fromEntries(list('public/assets').map((f) => [`/${relative('public', f).replaceAll('\\', '/')}`, statSync(f).size]));
      return `export default ${JSON.stringify(sizes)};`;
    },
  };
}

export default defineConfig({ plugins: [assetSizes()] });
