// ...existing code...
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
  selectedGalleryImage: string;
  
  // Image dragging properties
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private imageX = 0;
  private imageY = 0;

  onGalleryImageChange() {
    console.log('Selected item:', this.selectedGalleryImage);
    if (this.isImage(this.selectedGalleryImage)) {
      // Apply image as texture to Mesh10
      if (this.ringModel) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(this.selectedGalleryImage, (texture: any) => {
          this.ringModel.traverse((obj: any) => {
            if (obj.name === 'Mesh10' && obj.material) {
              obj.material.map = texture;
              obj.material.needsUpdate = true;
            }
          });
        });
      }
    } else if (this.isGlb(this.selectedGalleryImage)) {
      console.log('GLB selected, loading model...');
      // Remove previous model from scene
      if (this.ringModel && this.scene) {
        this.scene.remove(this.ringModel);
        this.ringModel = null;
      }
      // Scene hazır değilse bekle ve tekrar dene
      if (this.scene && this.renderer && this.threeContainer) {
        this.loadSelectedGlbModel();
      } else {
        console.log('Scene henüz hazır değil, 1 saniye sonra tekrar denenecek...');
        setTimeout(() => {
          if (this.scene && this.renderer && this.threeContainer) {
            this.loadSelectedGlbModel();
          }
        }, 1000);
      }
    }
  }

  loadSelectedGlbModel() {
    if (!this.isGlb(this.selectedGalleryImage)) return;
    
    // Scene ve renderer kontrol et
    if (!this.scene || !this.renderer || !this.threeContainer) {
      console.error('Three.js components henüz hazır değil');
      return;
    }
    
    console.log('Loading GLB model:', this.selectedGalleryImage);
    const loader = new GLTFLoader();
    
    // Path'i düzelt - Angular assets klasörü için doğru path
    let modelPath = this.selectedGalleryImage;
    
    console.log('Original path:', modelPath);
    console.log('Final model path:', modelPath);
    
    loader.load(
      modelPath,
      (gltf: any) => {
        console.log('GLB model loaded successfully');
        
        // Eski modeli temizle
        if (this.ringModel) {
          this.scene.remove(this.ringModel);
          this.ringModel = null;
        }
        
        this.ringModel = gltf.scene;
        
        // Mesh bilgilerini topla ve konsola yaz
        const meshNames: string[] = [];
        this.ringModel.traverse((obj: any) => {
          if (obj.isMesh) {
            meshNames.push(obj.name);
            obj.castShadow = true;
            obj.receiveShadow = true;
            
            // Material ayarları
            if (obj.material) {
              if ('metalness' in obj.material) {
                obj.material.metalness = 0.95;
                obj.material.roughness = 0.1;
                obj.material.envMapIntensity = 1.2;
              }
              obj.material.needsUpdate = true;
            }
          }
        });
        
        console.log('Yüklenen modeldeki meshler:', meshNames);
        
        // Model boyutunu otomatik ayarla
        const box = new THREE.Box3().setFromObject(this.ringModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Modeli merkeze al
        this.ringModel.position.sub(center);
        
        // Boyutu normalize et
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxSize; // 1.5 birim hedef boyut
        this.ringModel.scale.setScalar(scale);
        
        // Y ekseninde biraz aşağı kaydır
        this.ringModel.position.y = 0.0;
        
        this.scene.add(this.ringModel);
        console.log('Model sahneye eklendi');
      },
      (progress: any) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (err: any) => {
        console.error('Failed to load GLB model:', err);
        console.error('Model path:', modelPath);
      }
    );
  }
  filterProngTips(tip: string) {
    this.state.prongTips = tip;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name === 'ProngTip') {
        obj.visible = true;
        obj.material.color.set(tip === 'Rounded' ? '#5a5abc' : tip === 'Claw' ? '#b76e79' : tip === 'Knife' ? '#222' : '#5a5abc');
      }
    });
  }

  filterProngPave(pave: string) {
    this.state.prongPave = pave;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name === 'ProngPave') {
        obj.visible = (pave === 'Pave');
      }
    });
  }
  // Band filter functions
  filterBandStyle(style: string) {
    this.state.bandStyle = style;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Band')) {
        obj.scale.x = style === 'Square' ? 1.2 : 1.0;
      }
    });
  }

  filterCathedral(cathedral: string) {
    this.state.cathedral = cathedral;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Cathedral')) {
        obj.visible = (cathedral === 'Cathedral');
      }
    });
  }

  filterBandWidth(width: number) {
    this.state.bandWidth = width;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Band')) {
        obj.scale.y = width / 2.0;
      }
    });
  }

  filterRingSize(size: number) {
    this.state.ringSize = size;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Ring')) {
        obj.scale.set(size / 6, size / 6, size / 6);
      }
    });
  }

  filterFit(fit: string) {
    this.state.fit = fit;
    // Model logic can be added here
  }
  // Diamonds filter functions
  filterCaratSize(size: string) {
    this.state.caratSize = size;
    if (!this.ringModel) return;
    // Sadece 'Mesh10' mesh için göster/gizle
    this.ringModel.traverse((obj: any) => {
      if (obj.name === 'Mesh10') {
        obj.visible = true; // Her zaman görünür, isterseniz burayı özelleştirin
      }
    });
  }

  filterShape(shape: number) {
    this.state.shape = shape;
    if (!this.ringModel) return;
    // Sadece 'Mesh10' mesh için şekil değişimi
    this.ringModel.traverse((obj: any) => {
      if (obj.name === 'Mesh10') {
        obj.scale.set(1, 1, 1 + shape / 100);
      }
    });
  }

  filterDiamondType(type: string) {
    this.state.diamondType = type;
    if (!this.ringModel) return;
    // Sadece 'Mesh10' mesh için renk değişimi
    this.ringModel.traverse((obj: any) => {
      if (obj.name === 'Mesh10') {
        obj.material.color.set(type === 'Lab Grown' ? '#b9f2ff' : type === 'Natural' ? '#ffffff' : '#cccccc');
      }
    });
  }
  isImage(path: string): boolean {
    return /\.(jpg|jpeg|png|gif)$/i.test(path);
  }
  isGlb(path: string): boolean {
    return /\.glb$/i.test(path);
  }

  // Image dragging functions
  onImageMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.imageX;
    this.startY = event.clientY - this.imageY;
    
    // Global mouse events for better dragging
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);
    
    event.preventDefault();
  }

  onImageMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    this.imageX = event.clientX - this.startX;
    this.imageY = event.clientY - this.startY;
    
  const imageElement = event.target as HTMLElement;
  imageElement.style.setProperty('--tx', this.imageX + 'px');
  imageElement.style.setProperty('--ty', this.imageY + 'px');
  imageElement.style.transformOrigin = 'center center';
    event.preventDefault();
  }

  onImageMouseUp(event: MouseEvent) {
    this.isDragging = false;
    event.preventDefault();
  }

  // Global mouse event handlers for better dragging
  private onDocumentMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return;
    
    // Serbest sürükleme - sınır yok
    this.imageX = event.clientX - this.startX;
    this.imageY = event.clientY - this.startY;
    
    const imageContainer = document.querySelector('.image-container img') as HTMLElement;
    if (imageContainer) {
      imageContainer.style.setProperty('--tx', this.imageX + 'px');
      imageContainer.style.setProperty('--ty', this.imageY + 'px');
      imageContainer.style.transformOrigin = 'center center';
      imageContainer.style.pointerEvents = 'auto';
    }
    event.preventDefault();
  };

  private onDocumentMouseUp = (event: MouseEvent) => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
    event.preventDefault();
  };

  // 3D Canvas interaction functions
  onThreeMouseDown(event: MouseEvent) {
    // Change cursor to grabbing when dragging starts
    const canvas = this.renderer?.domElement;
    if (canvas) {
      canvas.style.cursor = 'grabbing';
    }
    // OrbitControls'ın mouse event'lerini enable et
    if (this.controls) {
      this.controls.enabled = true;
    }
    event.preventDefault();
  }

  onThreeMouseUp(event: MouseEvent) {
    // Reset cursor when dragging ends
    const canvas = this.renderer?.domElement;
    if (canvas) {
      canvas.style.cursor = 'grab';
    }
    event.preventDefault();
  }

  onThreeWheel(event: WheelEvent) {
    // Wheel event'lerinin OrbitControls tarafından işlenmesine izin ver
    if (this.controls) {
      this.controls.enabled = true;
    }
    // Event propagation'ı durdurma, OrbitControls kendi handle etsin
    event.stopPropagation();
  }

  // Toggle auto rotation for better 3D demonstration
  toggleAutoRotation() {
    if (this.controls) {
      this.controls.autoRotate = !this.controls.autoRotate;
    }
  }

  // Reset camera position
  resetCameraPosition() {
    if (this.controls) {
      this.controls.reset();
    }
  }
  // Asset images for model modification
  galleryImages: string[] = [
    // Images

    // 3D Models (GLB) - Corrected paths
    'assets/Bilezik5.glb',
    'assets/ring14full.glb',
    'assets/ring20body.glb',
    'assets/the_ring_1_carat.glb',
    'assets/n_5_full.glb',
    'assets/n_8_full.glb'
  ];
  constructor() {
    this.selectedGalleryImage = this.galleryImages[0];
  }
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
      if (obj.name === 'Basket') {
        obj.visible = (type === 'Basket');
        obj.material.color.set('#b76e79');
      }
      if (obj.name === 'Halo') {
        obj.visible = (type === 'Halo');
        obj.material.color.set('#eaeaea');
      }
      if (obj.name === 'Hidden Halo') {
        obj.visible = (type === 'Hidden Halo');
        obj.material.color.set('#c08081');
      }
      // Mesh10 için Head filtre etkisi
      if (obj.name === 'Mesh10') {
        if (type === 'Basket') {
          obj.material.color.set('#b76e79');
        } else if (type === 'Halo') {
          obj.material.color.set('#eaeaea');
        } else if (type === 'Hidden Halo') {
          obj.material.color.set('#c08081');
        } else {
          obj.material.color.set('#ffffff');
        }
      }
    });
  }

  changeProngs(count: string) {
    this.state.prongs = count;
    if (!this.ringModel) return;
    this.ringModel.traverse((obj: any) => {
      if (obj.name && obj.name.includes('Prong')) {
          if (count === '4 Prong') {
            obj.visible = ['Prong1','Prong2','Prong3','Prong4'].includes(obj.name);
          } else if (count === '6 Prong') {
            obj.visible = ['Prong1','Prong2','Prong3','Prong4','Prong5','Prong6'].includes(obj.name);
          } else if (count === '4 Compass') {
            obj.visible = ['Prong1','Prong2','Prong4','Prong6'].includes(obj.name);
          } else {
            obj.visible = false;
          }
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
      // Mesh10 için Band filtre etkisi
      if (obj.name === 'Mesh10') {
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
      // Mesh10 için Ring Size etkisi
      if (obj.name === 'Mesh10') {
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
    
    // Eğer seçili item GLB ise ve henüz yüklenmediyse, şimdi yükle
    if (this.isGlb(this.selectedGalleryImage) && !this.ringModel) {
      setTimeout(() => {
        this.loadSelectedGlbModel();
      }, 500);
    }
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

    // Enhanced Controls for better 3D model dragging
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Enable smooth damping for better interaction
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.03;
    
    // Allow panning for better control - SERBEST TAŞIMA
    this.controls.enablePan = true;
    this.controls.panSpeed = 3.0;
    
    // Enable zooming - SERBEST ZOOM
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1.5;
    
    // Set rotation limits - SERBEST DÖNME
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 50.0;
    this.controls.minPolarAngle = 0; // Tam serbest
    this.controls.maxPolarAngle = Math.PI; // Tam serbest
    
    // Enable rotation - SERBEST DÖNME
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 1.5;
    
    // Mouse button ayarları - TAŞIMA İÇİN
    // Sol tık: döndürme, Sağ tık: taşıma, Orta tık: zoom
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN
    };
    
    // Touch ayarları - MOBİL İÇİN
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    
    // Klavye desteği - SHIFT+SOL CLICK = TAŞIMA
    this.controls.keys = {
      LEFT: 'ArrowLeft',
      UP: 'ArrowUp', 
      RIGHT: 'ArrowRight',
      BOTTOM: 'ArrowDown'
    };
    
    // Auto rotate kapalı
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0;
  }

  private loadModel() {
        // Modeldeki tüm meshlerin detaylarını konsola yazdır
        if (this.ringModel) {
          this.ringModel.traverse((obj: any) => {
            if (obj.isMesh) {
              console.log('Mesh:', {
                name: obj.name,
                type: obj.type,
                material: obj.material?.name || obj.material?.type,
                geometry: obj.geometry?.type
              });
            }
          });
        }
    const loader = new GLTFLoader();
  // Pick a ring model from assets
  const url = 'assets/kendin-yap-fe/public/assets/models/source/Bilezik5.glb';
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
          // Mesh isimlerini konsola yazdır
          console.log('Mesh name:', obj.name);
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
