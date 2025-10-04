import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { Texture } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  isImage(path: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(path);
  }
  isGlb(path: string): boolean {
    return /\.glb$/i.test(path);
  }
  // Asset images for model modification
  galleryImages: string[] = [
    // Images
    'assets/kendin-yap-fe/public/gallery/necklace4/DSC07323.JPG',
    'assets/kendin-yap-fe/public/gallery/necklace4/DSC07326.JPG',
    'assets/kendin-yap-fe/public/gallery/necklace4/DSC07332.JPG',
    // 3D Models (GLB)
    'assets/kendin-yap-fe/public/assets/models/source/Bilezik5.glb',
    'assets/kendin-yap-fe/public/assets/models/source/ring14full.glb',
    'assets/kendin-yap-fe/public/assets/models/source/ring20body.glb',
    'assets/kendin-yap-fe/public/assets/models/source/the_ring_1_carat.glb',
    'assets/kendin-yap-fe/public/assets/models/source/necklaces/necklace_8/n_8_full.glb'
  ];
  private ringModel: any = null;

  // === Filter action functions for right panel ===
  changeMetalColor(color: string) {
    this.state.metalColor = color;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.isMesh && obj.material && obj.material.metalness !== undefined) {
        obj.material.color.set(color === 'Platinum' ? '#e5e4e2' : color === '14k Rose' ? '#b76e79' : color === '18k Rose' ? '#c08081' : '#eaeaea');
      }
    });
  }

  changeDiamondType(type: string) {
    this.state.diamondType = type;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.isMesh && obj.material && obj.material.metalness === undefined) {
        obj.material.color.set(type === 'Lab Grown' ? '#b9f2ff' : '#ffffff');
      }
    });
  }

  changeBasket(type: string) {
    this.state.basket = type;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Basket')) {
        obj.visible = (type !== 'None');
      }
    });
  }

  changeProngs(count: string) {
    this.state.prongs = count;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Prong')) {
        obj.visible = (obj.name.includes(count.split(' ')[0]));
      }
    });
  }

  changeBandStyle(style: string) {
    this.state.bandStyle = style;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Band')) {
        obj.scale.x = style === 'Square' ? 1.2 : 1.0;
      }
    });
  }

  changeRingSize(size: number) {
    this.state.ringSize = size;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Ring')) {
        obj.scale.set(size / 6, size / 6, size / 6);
      }
    });
  }
  @ViewChild('threeContainer', { static: false }) threeContainer!: ElementRef<HTMLDivElement>;

  // Three.js essentials
  private renderer!: any;
  private scene!: any;
  private camera!: any;
  private controls!: any;
  private animationId: number | null = null;
  private resizeObserver?: ResizeObserver;
  expanded: { metal: boolean; diamonds: boolean; head: boolean; band: boolean; gallery: boolean } = {
    metal: true,
    diamonds: true,
    head: true,
    band: true,
    gallery: true
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

  toggle(key: 'metal' | 'diamonds' | 'head' | 'band' | 'gallery') {
    this.expanded[key] = !this.expanded[key];
  }

  // Apply selected image as texture to the ring model
  applyImageTexture(index: number) {
    if (!this.ringModel) return;
    const imgPath = this.galleryImages[index];
    const textureLoader = new THREE.TextureLoader();
  textureLoader.load(imgPath, (texture: any) => {
      this.ringModel.traverse((obj: any) => {
        if (obj.isMesh && obj.material && obj.material.map !== undefined) {
          obj.material.map = texture;
          obj.material.needsUpdate = true;
        }
      });
    });
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
        this.ringModel = gltf.scene;
        this.ringModel.traverse((obj: any) => {
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
        this.ringModel.scale.set(1, 1, 1);
        this.ringModel.position.set(0, -0.6, 0);
        this.scene.add(this.ringModel);
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
