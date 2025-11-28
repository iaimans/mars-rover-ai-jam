import * as THREE from 'three';

export class CubePlanet {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Create cube planet
    this.cube = this.createCubePlanet();
    this.scene.add(this.cube);

    // Add lights
    this.addLights();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize(container));
  }

  private createCubePlanet(): THREE.Mesh {
    // Create cube geometry
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create materials for each face with different colors
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff6b6b }), // Right - Red
      new THREE.MeshStandardMaterial({ color: 0x4ecdc4 }), // Left - Cyan
      new THREE.MeshStandardMaterial({ color: 0xffe66d }), // Top - Yellow
      new THREE.MeshStandardMaterial({ color: 0x95e1d3 }), // Bottom - Mint
      new THREE.MeshStandardMaterial({ color: 0xf38181 }), // Front - Pink
      new THREE.MeshStandardMaterial({ color: 0xaa96da }), // Back - Purple
    ];

    const cube = new THREE.Mesh(geometry, materials);
    return cube;
  }

  private addLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  private handleResize(container: HTMLElement): void {
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  public animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Rotate the cube
    this.cube.rotation.x += 0.005;
    this.cube.rotation.y += 0.005;

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
    window.removeEventListener('resize', () => this.handleResize);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.Camera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
