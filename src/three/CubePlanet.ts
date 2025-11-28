import * as THREE from 'three';
import type { Obstacle } from '../rover/ObstacleManager';
import type { CubeFace, Direction } from '../rover/RoverController';

const GRID_SIZE = 10;

interface AnimationState {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startRot: THREE.Quaternion;
  endRot: THREE.Quaternion;
  progress: number;
  duration: number;
  onComplete: () => void;
}

interface ParticleSystem {
  points: THREE.Points;
  birthTime: number;
  lifetime: number;
}

export class CubePlanet {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cube: THREE.Mesh;
  private animationId: number | null = null;
  private roverGroup: THREE.Group | null = null;
  private obstacleGroup: THREE.Group | null = null;
  private gridGroup: THREE.Group | null = null;
  private roverAnimation: AnimationState | null = null;
  private particles: ParticleSystem[] = [];
  private lastTime: number = 0;

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
    // Position camera to see the Front face (positive Z)
    this.camera.position.set(0, 0, 6);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Create cube planet
    this.cube = this.createCubePlanet();
    this.scene.add(this.cube);

    // Add grid lines as child of cube so they rotate together
    this.gridGroup = this.createGridLines();
    this.cube.add(this.gridGroup);

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
    
    const currentTime = performance.now();
    const deltaTime = this.lastTime > 0 ? currentTime - this.lastTime : 0;
    this.lastTime = currentTime;

    // Note: Cube rotation removed to keep rover face visible
    // The cube is now oriented to show the front face where the rover starts

    // Update rover animation
    if (this.roverAnimation) {
      this.updateRoverAnimation(deltaTime);
    }

    // Update and cleanup particles
    this.updateParticles(currentTime);

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Dispose rover (now child of cube)
    if (this.roverGroup) {
      this.cube.remove(this.roverGroup);
      this.roverGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Dispose obstacles (now child of cube)
    if (this.obstacleGroup) {
      this.cube.remove(this.obstacleGroup);
      this.obstacleGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Dispose grid (now child of cube)
    if (this.gridGroup) {
      this.cube.remove(this.gridGroup);
      this.gridGroup.traverse((child) => {
        if (child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Dispose particles
    this.particles.forEach(p => {
      this.scene.remove(p.points);
      p.points.geometry.dispose();
      if (Array.isArray(p.points.material)) {
        p.points.material.forEach(m => m.dispose());
      } else {
        p.points.material.dispose();
      }
    });

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

  /**
   * Create grid lines on each face of the cube
   */
  private createGridLines(): THREE.Group {
    const gridGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff, 
      opacity: 0.3, 
      transparent: true 
    });

    // Create grid for each face
    for (let face = 0; face < 6; face++) {
      const points: THREE.Vector3[] = [];
      const cellSize = 2 / GRID_SIZE;

      // Vertical lines
      for (let i = 0; i <= GRID_SIZE; i++) {
        const offset = -1 + i * cellSize;
        for (let j = 0; j <= GRID_SIZE; j++) {
          const offset2 = -1 + j * cellSize;
          
          switch (face) {
            case 0: // Right (positive X)
              points.push(new THREE.Vector3(1.01, offset, offset2));
              break;
            case 1: // Left (negative X)
              points.push(new THREE.Vector3(-1.01, offset, offset2));
              break;
            case 2: // Top (positive Y)
              points.push(new THREE.Vector3(offset2, 1.01, offset));
              break;
            case 3: // Bottom (negative Y)
              points.push(new THREE.Vector3(offset2, -1.01, offset));
              break;
            case 4: // Front (positive Z)
              points.push(new THREE.Vector3(offset2, offset, 1.01));
              break;
            case 5: // Back (negative Z)
              points.push(new THREE.Vector3(offset2, offset, -1.01));
              break;
          }
        }
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const lines = new THREE.LineSegments(geometry, lineMaterial);
      gridGroup.add(lines);
    }

    return gridGroup;
  }

  /**
   * Convert grid coordinates to 3D world position
   */
  private gridToWorld(face: CubeFace, x: number, y: number): THREE.Vector3 {
    const cellSize = 2 / GRID_SIZE;
    const offset = cellSize / 2;
    
    // Map from (0,0) top-left to world coordinates
    const gridX = -1 + x * cellSize + offset;
    const gridY = -1 + y * cellSize + offset;

    switch (face) {
      case 0: // Right (positive X)
        return new THREE.Vector3(1.02, -gridY, gridX);
      case 1: // Left (negative X)
        return new THREE.Vector3(-1.02, -gridY, -gridX);
      case 2: // Top (positive Y)
        return new THREE.Vector3(gridX, 1.02, gridY);
      case 3: // Bottom (negative Y)
        return new THREE.Vector3(gridX, -1.02, -gridY);
      case 4: // Front (positive Z)
        return new THREE.Vector3(gridX, -gridY, 1.02);
      case 5: // Back (negative Z)
        return new THREE.Vector3(-gridX, -gridY, -1.02);
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }

  /**
   * Get rotation quaternion for rover direction on a face
   */
  private getRotationForDirection(face: CubeFace, direction: Direction): THREE.Quaternion {
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();

    // Base orientation for each face
    switch (face) {
      case 0: // Right
        euler.set(0, Math.PI / 2, 0);
        break;
      case 1: // Left
        euler.set(0, -Math.PI / 2, 0);
        break;
      case 2: // Top
        euler.set(-Math.PI / 2, 0, 0);
        break;
      case 3: // Bottom
        euler.set(Math.PI / 2, 0, 0);
        break;
      case 4: // Front
        euler.set(0, 0, 0);
        break;
      case 5: // Back
        euler.set(0, Math.PI, 0);
        break;
    }

    quaternion.setFromEuler(euler);

    // Additional rotation based on direction
    const dirRotation = new THREE.Quaternion();
    const dirEuler = new THREE.Euler();
    
    switch (direction) {
      case 'N':
        dirEuler.set(0, 0, 0);
        break;
      case 'E':
        dirEuler.set(0, 0, -Math.PI / 2);
        break;
      case 'S':
        dirEuler.set(0, 0, Math.PI);
        break;
      case 'W':
        dirEuler.set(0, 0, Math.PI / 2);
        break;
    }

    dirRotation.setFromEuler(dirEuler);
    quaternion.multiply(dirRotation);

    return quaternion;
  }

  /**
   * Create rover 3D mesh
   */
  private createRover(): THREE.Group {
    const roverGroup = new THREE.Group();

    // Rover body (cone pointing up, will be rotated to face forward)
    const coneGeometry = new THREE.ConeGeometry(0.08, 0.15, 8);
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800 });
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.rotation.x = Math.PI / 2; // Point forward
    roverGroup.add(cone);

    // Directional indicator (small cylinder at tip)
    const indicatorGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8);
    const indicatorMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.rotation.z = Math.PI / 2;
    indicator.position.x = 0.1;
    roverGroup.add(indicator);

    return roverGroup;
  }

  /**
   * Initialize rover on the planet
   */
  public initializeRover(face: CubeFace, x: number, y: number, direction: Direction): void {
    if (this.roverGroup) {
      this.cube.remove(this.roverGroup);
    }

    this.roverGroup = this.createRover();
    const position = this.gridToWorld(face, x, y);
    this.roverGroup.position.copy(position);
    
    const rotation = this.getRotationForDirection(face, direction);
    this.roverGroup.quaternion.copy(rotation);

    this.cube.add(this.roverGroup);

    // Rotate cube to show the current face
    this.rotateCubeToShowFace(face);
  }

  /**
   * Rotate cube to show the specified face towards the camera
   */
  private rotateCubeToShowFace(face: CubeFace): void {
    // Set cube rotation to show the specified face
    switch (face) {
      case 0: // RIGHT - rotate to show right face
        this.cube.rotation.set(0, Math.PI / 2, 0);
        break;
      case 1: // LEFT - rotate to show left face
        this.cube.rotation.set(0, -Math.PI / 2, 0);
        break;
      case 2: // TOP - rotate to show top face
        this.cube.rotation.set(-Math.PI / 2, 0, 0);
        break;
      case 3: // BOTTOM - rotate to show bottom face
        this.cube.rotation.set(Math.PI / 2, 0, 0);
        break;
      case 4: // FRONT - show front face (default view)
        this.cube.rotation.set(0, 0, 0);
        break;
      case 5: // BACK - rotate to show back face
        this.cube.rotation.set(0, Math.PI, 0);
        break;
    }
  }

  /**
   * Animate rover to new position
   */
  public animateRoverTo(
    face: CubeFace, 
    x: number, 
    y: number, 
    direction: Direction, 
    duration: number,
    onComplete: () => void
  ): void {
    if (!this.roverGroup || this.roverAnimation) {
      return;
    }

    const startPos = this.roverGroup.position.clone();
    const endPos = this.gridToWorld(face, x, y);
    const startRot = this.roverGroup.quaternion.clone();
    const endRot = this.getRotationForDirection(face, direction);

    // Check if face changed - if so, rotate cube to show new face
    const currentFace = this.getCurrentRoverFace();
    if (currentFace !== face) {
      this.rotateCubeToShowFace(face);
    }

    this.roverAnimation = {
      startPos,
      endPos,
      startRot,
      endRot,
      progress: 0,
      duration,
      onComplete
    };
  }

  /**
   * Get current rover face based on position
   */
  private getCurrentRoverFace(): CubeFace | null {
    if (!this.roverGroup) return null;
    
    const pos = this.roverGroup.position;
    const threshold = 0.5;
    
    // Determine which face based on position
    if (Math.abs(pos.x - 1.02) < threshold) return 0; // RIGHT
    if (Math.abs(pos.x + 1.02) < threshold) return 1; // LEFT
    if (Math.abs(pos.y - 1.02) < threshold) return 2; // TOP
    if (Math.abs(pos.y + 1.02) < threshold) return 3; // BOTTOM
    if (Math.abs(pos.z - 1.02) < threshold) return 4; // FRONT
    if (Math.abs(pos.z + 1.02) < threshold) return 5; // BACK
    
    return 4; // Default to FRONT
  }

  /**
   * Update rover animation
   */
  private updateRoverAnimation(deltaTime: number): void {
    if (!this.roverAnimation || !this.roverGroup) {
      return;
    }

    this.roverAnimation.progress += deltaTime;
    const t = Math.min(this.roverAnimation.progress / this.roverAnimation.duration, 1);

    // Smooth easing
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    // Lerp position
    this.roverGroup.position.lerpVectors(
      this.roverAnimation.startPos,
      this.roverAnimation.endPos,
      eased
    );

    // Slerp rotation
    this.roverGroup.quaternion.slerpQuaternions(
      this.roverAnimation.startRot,
      this.roverAnimation.endRot,
      eased
    );

    if (t >= 1) {
      const callback = this.roverAnimation.onComplete;
      this.roverAnimation = null;
      callback();
    }
  }

  /**
   * Set obstacles on the planet
   */
  public setObstacles(obstacles: Obstacle[]): void {
    if (this.obstacleGroup) {
      this.cube.remove(this.obstacleGroup);
      this.obstacleGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    this.obstacleGroup = new THREE.Group();

    const obstacleGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    obstacles.forEach(obstacle => {
      const mesh = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      const position = this.gridToWorld(obstacle.face as CubeFace, obstacle.x, obstacle.y);
      mesh.position.copy(position);
      this.obstacleGroup!.add(mesh);
    });

    this.cube.add(this.obstacleGroup);
  }

  /**
   * Spawn collision particles at location
   */
  public spawnCollisionParticles(face: CubeFace, x: number, y: number): void {
    const particleCount = 30;
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    const centerPos = this.gridToWorld(face, x, y);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = centerPos.x;
      positions[i * 3 + 1] = centerPos.y;
      positions[i * 3 + 2] = centerPos.z;

      // Random velocity
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        )
      );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff0000,
      size: 0.05,
      transparent: true,
      opacity: 1
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    this.particles.push({
      points,
      birthTime: performance.now(),
      lifetime: 500 // 500ms
    });

    // Store velocities in userData for animation
    points.userData.velocities = velocities;
  }

  /**
   * Update and cleanup particles
   */
  private updateParticles(currentTime: number): void {
    this.particles = this.particles.filter(particle => {
      const age = currentTime - particle.birthTime;
      
      if (age >= particle.lifetime) {
        // Remove expired particles
        this.scene.remove(particle.points);
        particle.points.geometry.dispose();
        if (Array.isArray(particle.points.material)) {
          particle.points.material.forEach(m => m.dispose());
        } else {
          particle.points.material.dispose();
        }
        return false;
      }

      // Update particle positions
      const positions = particle.points.geometry.attributes.position.array as Float32Array;
      const velocities = particle.points.userData.velocities as THREE.Vector3[];

      for (let i = 0; i < velocities.length; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;
      }

      particle.points.geometry.attributes.position.needsUpdate = true;

      // Fade out
      const progress = age / particle.lifetime;
      if (!Array.isArray(particle.points.material)) {
        particle.points.material.opacity = 1 - progress;
      }

      return true;
    });
  }
}
