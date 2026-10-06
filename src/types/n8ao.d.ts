// n8ao không kèm khai báo kiểu — chỉ khai phần dùng trong core/graphics.ts.
declare module 'n8ao' {
  import type { Pass } from 'postprocessing';
  import type { Camera, Scene } from 'three';

  export class N8AOPostPass extends Pass {
    constructor(scene: Scene, camera: Camera, width?: number, height?: number);
    configuration: { aoRadius: number; distanceFalloff: number; intensity: number; halfRes: boolean; [k: string]: unknown };
    setQualityMode(mode: 'Performance' | 'Low' | 'Medium' | 'High' | 'Ultra'): void;
  }
}
