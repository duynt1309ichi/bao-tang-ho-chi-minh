import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect } from 'postprocessing';
import { N8AOPostPass } from 'n8ao';
import { PRESETS, type Quality } from './quality';

/**
 * Renderer + hậu kỳ theo mức chất lượng (HLD 7.3). Thấp: vẽ thẳng, tone mapping của renderer.
 * Trung bình/Cao: EffectComposer (bloom, SMAA; Cao thêm N8AO + vignette), tone mapping trong hậu kỳ.
 */
export class Graphics {
  readonly renderer: THREE.WebGLRenderer;
  private composer: EffectComposer | null = null;
  quality: Quality = 'medium';

  constructor(
    canvas: HTMLCanvasElement,
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
    private shadowLight: THREE.DirectionalLight,
  ) {
    // Khử răng cưa bằng SMAA ở hậu kỳ; MSAA của canvas vô ích khi vẽ qua composer.
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  apply(q: Quality) {
    this.quality = q;
    const p = PRESETS[q];
    const { renderer, scene, camera } = this;
    renderer.setPixelRatio(Math.min(devicePixelRatio, p.pixelRatio));

    const shadows = p.shadowMap > 0;
    if (renderer.shadowMap.enabled !== shadows) {
      renderer.shadowMap.enabled = shadows;
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) for (const m of [o.material].flat()) m.needsUpdate = true;
      });
    }
    this.shadowLight.castShadow = shadows;
    if (shadows && this.shadowLight.shadow.mapSize.x !== p.shadowMap) {
      this.shadowLight.shadow.mapSize.setScalar(p.shadowMap);
      this.shadowLight.shadow.map?.dispose();
      this.shadowLight.shadow.map = null;
    }

    this.composer?.dispose();
    this.composer = null;
    renderer.toneMapping = p.post ? THREE.NoToneMapping : THREE.NeutralToneMapping;
    if (p.post) {
      const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
      composer.addPass(new RenderPass(scene, camera));
      if (p.ao) {
        const ao = new N8AOPostPass(scene, camera, innerWidth, innerHeight);
        ao.configuration.aoRadius = 1.2;
        ao.configuration.distanceFalloff = 1;
        ao.configuration.intensity = 2.5;
        ao.configuration.halfRes = true;
        ao.setQualityMode('Medium');
        composer.addPass(ao);
      }
      const bloom = new BloomEffect({ luminanceThreshold: 1.6, luminanceSmoothing: 0.3, intensity: 0.5, radius: 0.6, mipmapBlur: true });
      const effects = [bloom, ...(p.vignette ? [new VignetteEffect({ offset: 0.3, darkness: 0.45 })] : []), new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL })];
      composer.addPass(new EffectPass(camera, ...effects));
      composer.addPass(new EffectPass(camera, new SMAAEffect()));
      this.composer = composer;
    }
    this.resize();
  }

  resize() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.composer?.setSize(innerWidth, innerHeight, false);
  }

  render() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}
