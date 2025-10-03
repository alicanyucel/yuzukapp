// Minimal shims to satisfy TypeScript for Three.js and examples modules
// If you prefer full typings, install: npm i -D @types/three

declare module 'three';

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    constructor(object: any, domElement?: any);
    enableDamping: boolean;
    enablePan: boolean;
    minDistance: number;
    maxDistance: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    update(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader.js' {
  export class GLTFLoader {
    load(
      url: string,
      onLoad: (gltf: any) => void,
      onProgress?: (ev: any) => void,
      onError?: (err: any) => void
    ): void;
  }
}
