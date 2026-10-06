import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { assetUrl } from '../core/loader';
import { CAPSULE } from './collision';

export type CharacterId = 'nam' | 'nu';
export type Clip = 'idle' | 'walk' | 'run';
export const CHARACTER_LABEL: Record<CharacterId, string> = { nam: 'Nam', nu: 'Nữ' };

const FADE = 0.2; // FR-04: cross-fade 0,2 s
/** Hệ số tốc độ hoạt ảnh để chân không trượt ở 2,0 / 4,5 m/s (chỉnh bằng mắt). */
const TIME_SCALE: Record<Clip, number> = { idle: 1, walk: 1.15, run: 0.9 };

const loader = new GLTFLoader();
const cache = new Map<CharacterId, Promise<Character>>();

/** Nạp nhân vật CC0 (public/assets/characters, tools/blender/prepare_characters.py); mỗi loại nạp một lần. */
export function loadCharacter(id: CharacterId): Promise<Character> {
  let p = cache.get(id);
  if (!p) {
    p = loader.loadAsync(assetUrl(`/assets/characters/${id}.glb`)).then((g) => new Character(g.scene, g.animations));
    p.catch(() => cache.delete(id)); // lỗi thì lần sau thử lại
    cache.set(id, p);
  }
  return p;
}

/** Mô hình có hoạt ảnh idle / walk / run, cao bằng viên nang va chạm (1,7 m), mặt hướng +z. */
export class Character {
  private mixer: THREE.AnimationMixer;
  private actions: Record<Clip, THREE.AnimationAction>;
  private current: Clip | null = null;

  constructor(
    readonly object: THREE.Object3D,
    clips: THREE.AnimationClip[],
  ) {
    const box = new THREE.Box3().setFromObject(object);
    object.scale.multiplyScalar(CAPSULE.height / (box.max.y - box.min.y));
    object.traverse((o) => {
      o.castShadow = true;
      if (o instanceof THREE.Mesh) o.frustumCulled = false; // hộp bao của mesh skin không theo hoạt ảnh
    });
    this.mixer = new THREE.AnimationMixer(object);
    const clip = (name: Clip) => {
      const c = clips.find((x) => x.name === name);
      if (!c) throw new Error(`Nhân vật thiếu hoạt ảnh "${name}"`);
      return this.mixer.clipAction(c).setEffectiveTimeScale(TIME_SCALE[name]);
    };
    this.actions = { idle: clip('idle'), walk: clip('walk'), run: clip('run') };
    this.play('idle');
  }

  play(name: Clip) {
    if (name === this.current) return;
    const next = this.actions[name].reset().play();
    if (this.current) next.crossFadeFrom(this.actions[this.current], FADE, false);
    this.current = name;
  }

  update(dt: number) {
    this.mixer.update(dt);
  }
}
