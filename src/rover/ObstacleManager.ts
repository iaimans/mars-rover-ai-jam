/**
 * ObstacleManager - Handles random obstacle generation and collision detection
 * 
 * Generates 60 obstacles (~10% of 600 total cells) across 6 cube faces
 * Ensures starting position remains clear
 */

export interface Obstacle {
  face: number;
  x: number;
  y: number;
}

const GRID_SIZE = 10;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE * 6; // 600 cells
const OBSTACLE_DENSITY = 0.10; // 10%
const OBSTACLE_COUNT = Math.floor(TOTAL_CELLS * OBSTACLE_DENSITY); // 60 obstacles

export class ObstacleManager {
  private obstacles: Map<number, Set<string>>; // face -> Set of "x,y" strings

  constructor(startFace: number, startX: number, startY: number) {
    this.obstacles = new Map();
    this.generateObstacles(startFace, startX, startY);
  }

  /**
   * Generate random obstacles across all cube faces
   * Ensures starting position is clear
   */
  private generateObstacles(startFace: number, startX: number, startY: number): void {
    const generated = new Set<string>(); // "face,x,y" strings to track unique positions
    const startKey = `${startFace},${startX},${startY}`;

    let attempts = 0;
    const maxAttempts = OBSTACLE_COUNT * 10; // Prevent infinite loop

    while (generated.size < OBSTACLE_COUNT && attempts < maxAttempts) {
      attempts++;

      // Random position across all 6 faces
      const face = Math.floor(Math.random() * 6);
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      const key = `${face},${x},${y}`;

      // Skip if position is starting location or already has obstacle
      if (key === startKey || generated.has(key)) {
        continue;
      }

      generated.add(key);
      
      // Add to obstacles map
      if (!this.obstacles.has(face)) {
        this.obstacles.set(face, new Set());
      }
      this.obstacles.get(face)!.add(`${x},${y}`);
    }
  }

  /**
   * Check if there's an obstacle at given position
   */
  public hasObstacle(face: number, x: number, y: number): boolean {
    const faceObstacles = this.obstacles.get(face);
    if (!faceObstacles) {
      return false;
    }
    return faceObstacles.has(`${x},${y}`);
  }

  /**
   * Get all obstacles for rendering
   */
  public getAllObstacles(): Obstacle[] {
    const result: Obstacle[] = [];
    
    this.obstacles.forEach((positions, face) => {
      positions.forEach(posStr => {
        const [x, y] = posStr.split(',').map(Number);
        result.push({ face, x, y });
      });
    });

    return result;
  }

  /**
   * Get number of obstacles generated
   */
  public getObstacleCount(): number {
    let count = 0;
    this.obstacles.forEach(positions => {
      count += positions.size;
    });
    return count;
  }

  /**
   * Get obstacles for a specific face
   */
  public getObstaclesForFace(face: number): Obstacle[] {
    const faceObstacles = this.obstacles.get(face);
    if (!faceObstacles) {
      return [];
    }

    const result: Obstacle[] = [];
    faceObstacles.forEach(posStr => {
      const [x, y] = posStr.split(',').map(Number);
      result.push({ face, x, y });
    });

    return result;
  }
}
