import * as THREE from 'three';
import { exhibits } from '../content/exhibits';
import { rooms } from '../content/rooms';
import type { Layout } from '../content/types';
import { assetUrl } from '../core/loader';
import { ZONE_COLORS } from '../ui/tokens';
import { buildGeometry, MATS, REVIEW_COLOR, signAreas, type CanvasName, type MatSpec, type TexName } from './geometry';
import { aboutPanel, exhibitAtlas, museumMapPanel, signAtlas, welcomePanel } from './signs';

export type TexSize = '1k' | '2k';

/** Map có trong public/assets/tex (tools/blender/convert_assets.py). */
const TEX_MAPS: Record<TexName, ('color' | 'normal' | 'rough')[]> = {
  plaster: ['color', 'normal'],
  parquet: ['color', 'normal', 'rough'],
  marble: ['color', 'normal', 'rough'],
  grass: ['color', 'normal'],
  carpet: ['normal'],
};
const SLOT = { color: 'map', normal: 'normalMap', rough: 'roughnessMap' } as const;

const loader = new THREE.TextureLoader();
const load = (url: string) => loader.loadAsync(assetUrl(url));

/**
 * Dựng mesh bảo tàng từ hình học chung (world/geometry.ts): một mesh mỗi nhóm vật liệu,
 * texture CC0 Poly Haven 1K/2K (HLD 7.3) và lightmap bake bằng Blender (tools/blender/bake_lightmap.py).
 */
export function buildBlockout(layout: Layout) {
  const { groups, models: modelParts, collider, spots } = buildGeometry(layout);

  const canvases: Record<CanvasName, THREE.Texture> = {
    atlas: exhibitAtlas(exhibits, rooms),
    signs: signAtlas(
      signAreas().map((id) => {
        const room = rooms.find((r) => r.id === id);
        if (room) return { kicker: `PHÒNG ${room.id.slice(1)} · CHƯƠNG ${room.chapter}`, title: room.title, color: ZONE_COLORS[room.zone] };
        return id === 'review'
          ? { kicker: 'CUỐI HÀNH LANG', title: 'Phòng ôn tập', color: REVIEW_COLOR }
          : { kicker: 'GIÁO TRÌNH TRIẾT HỌC MÁC – LÊNIN', title: 'Bảo tàng Triết học', color: '#2a2620' };
      }),
    ),
    welcome: welcomePanel(),
    museumMap: museumMapPanel(layout, rooms),
    about: aboutPanel(),
  };

  const group = new THREE.Group();
  const byTex = new Map<TexName, THREE.MeshStandardMaterial[]>();
  const baked: THREE.MeshStandardMaterial[] = [];
  const plain = (spec: MatSpec) => new THREE.MeshStandardMaterial({ color: spec.color, roughness: spec.roughness, metalness: spec.metalness ?? 0 });
  for (const g of groups) {
    const spec: MatSpec = MATS[g.key];
    const mat = plain(spec);
    if (spec.map && spec.map in canvases) mat.map = canvases[spec.map as CanvasName];
    else if (spec.map) (byTex.get(spec.map as TexName) ?? byTex.set(spec.map as TexName, []).get(spec.map as TexName)!).push(mat);
    if (spec.emissive) {
      mat.emissive.set(spec.color);
      mat.emissiveIntensity = spec.emissive;
    }
    if (g.baked) baked.push(mat);
    const mesh = new THREE.Mesh(g.geo, mat);
    mesh.castShadow = Boolean(spec.cast);
    mesh.receiveShadow = !spec.emissive;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
  }

  // Mô hình 🧊: mỗi hiện vật một mesh để bảng hiện vật xoay được (FR-13 2a); vật liệu dùng chung theo khu.
  const modelMats = new Map<string, THREE.MeshStandardMaterial>();
  const models = new Map<string, THREE.Mesh>();
  for (const part of modelParts) {
    const mat = modelMats.get(part.key) ?? modelMats.set(part.key, plain(MATS[part.key])).get(part.key)!;
    const mesh = new THREE.Mesh(part.geo, mat);
    part.matrix.decompose(mesh.position, mesh.quaternion, mesh.scale);
    mesh.castShadow = mesh.receiveShadow = true;
    models.set(part.id, mesh);
    group.add(mesh);
  }

  let texSize: TexSize | null = null;
  return {
    group,
    models,
    collider,
    spots,
    /** Tải (hoặc đổi) bộ texture 1K/2K; resolve khi mọi texture đã gắn. */
    async setTextureSize(size: TexSize) {
      if (texSize === size) return;
      texSize = size;
      await Promise.all(
        [...byTex].flatMap(([name, mats]) =>
          TEX_MAPS[name].map(async (m) => {
            const tex = await load(`/assets/tex/${name}_${size}_${m}.webp`);
            if (texSize !== size) return tex.dispose(); // đã đổi mức khác trong lúc tải
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.anisotropy = 8;
            if (m === 'color') tex.colorSpace = THREE.SRGBColorSpace;
            for (const mat of mats) {
              mat[SLOT[m]]?.dispose();
              mat[SLOT[m]] = tex;
              mat.needsUpdate = true;
            }
          }),
        ),
      );
    },
    /**
     * Gắn lightmap (kênh uv1). Ảnh lưu sRGB của (bức xạ / scale) → lightMapIntensity = scale × π
     * (three chia π trong BRDF Lambert). IBL trên mặt đã bake chỉ còn phần phản chiếu nhẹ.
     */
    async loadLightmap() {
      const [[day, dayScale], [night, nightScale]] = await Promise.all([lightmap('lightmap'), lightmap('lightmap_night')]);
      nightUniforms.nightMap.value = night;
      nightUniforms.nightIntensity.value = nightScale * Math.PI * LIGHTMAP_EXPOSURE;
      for (const mat of baked) {
        mat.lightMap = day;
        mat.lightMapIntensity = dayScale * Math.PI * LIGHTMAP_EXPOSURE;
        mat.envMapIntensity = 0.25;
        mat.onBeforeCompile = blendNight;
        mat.customProgramCacheKey = () => 'night-lightmap';
        mat.needsUpdate = true;
      }
    },
    /** 0 = ngày, 1 = đêm (FR-23): trộn lightmap ngày với lightmap đêm (chỉ đèn trong nhà + trăng). */
    set night(k: number) {
      nightUniforms.uNight.value = k;
    },
  };
}

async function lightmap(name: string) {
  const [tex, meta] = await Promise.all([load(`/assets/${name}.webp`), fetch(assetUrl(`/assets/${name}.json`)).then((r) => r.json() as Promise<{ scale: number }>)]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.channel = 1;
  return [tex, meta.scale] as const;
}

const nightUniforms = { nightMap: { value: null as THREE.Texture | null }, nightIntensity: { value: 1 }, uNight: { value: 0 } };
const LIGHTMAP_LINE = 'vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;';

/** Vá shader chuẩn: lightmap = trộn(ngày, đêm, uNight). Dùng chung uniform nên đổi một lần cho mọi vật liệu. */
function blendNight(shader: THREE.WebGLProgramParametersWithUniforms) {
  if (!THREE.ShaderChunk.lights_fragment_maps.includes(LIGHTMAP_LINE)) throw new Error('three đổi shader lightmap — cập nhật blendNight');
  Object.assign(shader.uniforms, nightUniforms);
  const chunk = THREE.ShaderChunk.lights_fragment_maps.replace(
    LIGHTMAP_LINE,
    'vec3 lightMapIrradiance = mix( lightMapTexel.rgb * lightMapIntensity, texture2D( nightMap, vLightMapUv ).rgb * nightIntensity, uNight );',
  );
  shader.fragmentShader = `uniform sampler2D nightMap;
uniform float nightIntensity;
uniform float uNight;
${shader.fragmentShader.replace('#include <lights_fragment_maps>', chunk)}`;
}

/** Bù độ sáng giữa đơn vị đèn Blender (W) và cảnh runtime; chỉnh bằng mắt. */
const LIGHTMAP_EXPOSURE = 0.85;
