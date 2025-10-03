import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef<HTMLDivElement>;

  // Three.js essentials
  private renderer!: any;
  private scene!: any;
  private camera!: any;
  private controls!: any;
  private animationId: number | null = null;
  private resizeObserver?: ResizeObserver;
  expanded: { metal: boolean; diamonds: boolean; head: boolean; band: boolean } = {
    metal: true,
    diamonds: true,
    head: true,
    band: true
  };

  state: any = {
    metalColor: '14k White',
    caratSize: 'One Stone',
    diamondType: 'Natural',
    basket: 'None',
    prongs: '4 Prong',
    prongTips: 'Rounded',
    prongPave: 'None',
    bandStyle: 'Round',
    cathedral: 'None',
    bandWidth: 2.0,
    ringSize: 6.0,
    fit: 'ComfortFit',
    shape: 50
  };

  toggle(key: 'metal' | 'diamonds' | 'head' | 'band') {
    this.expanded[key] = !this.expanded[key];
  }

  select(key: keyof HomeComponent['state'], value: any) {
    this.state[key] = value;
  }

  isSelected(key: keyof HomeComponent['state'], value: any): boolean {
    return this.state[key] === value;
  }

  // ==== Three.js setup ====
  ngAfterViewInit(): void {
    if (!this.threeContainer) return;
    this.initThree();
    this.loadModel();
    this.animate();

    // Resize handling
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.threeContainer.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.controls?.dispose();
    this.renderer?.dispose();
    this.resizeObserver?.disconnect();
  }

  private initThree() {
    const container = this.threeContainer.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf6f7fb);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    this.camera.position.set(0.6, 0.7, 2.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // Soft environment lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    hemi.position.set(0, 1, 0);
    this.scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(2, 3, 4);
    dir.castShadow = true;
    this.scene.add(dir);

    // Floor gradient look (fake with large plane + gradient fog)
    this.scene.fog = new THREE.Fog(0xf6f7fb, 6, 12);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 3.0;
    this.controls.minPolarAngle = Math.PI / 4;
    this.controls.maxPolarAngle = Math.PI / 1.8;
  }

  private loadModel() {
    const loader = new GLTFLoader();
    // Pick a ring model from assets
    const url = 'assets/kendin-yap-fe/public/assets/models/source/the_ring_1_carat.glb';

    loader.load(
      url,
      (gltf: any) => {
        const model = gltf.scene;
        model.traverse((obj: any) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            if (obj.material && 'metalness' in obj.material) {
              obj.material.metalness = 0.95;
              obj.material.roughness = 0.1;
              obj.material.envMapIntensity = 1.2;
            }
          }
        });

        model.scale.set(1, 1, 1);
        model.position.set(0, -0.6, 0);
        this.scene.add(model);
      },
      undefined,
      (err: any) => {
        console.error('Failed to load model', err);
      }
    );
  }

  private onResize() {
    const container = this.threeContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };
}
