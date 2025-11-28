import { describe, it, expect } from 'vitest';
import { ObstacleManager } from './ObstacleManager';
import { CubeFace } from './RoverController';

describe('ObstacleManager', () => {
  describe('Obstacle generation', () => {
    it('should generate approximately 60 obstacles (10% density)', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      const count = manager.getObstacleCount();
      
      // Allow for some variance due to randomness
      expect(count).toBeGreaterThanOrEqual(55);
      expect(count).toBeLessThanOrEqual(65);
    });

    it('should not place obstacle at starting position', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      const hasObstacleAtStart = manager.hasObstacle(CubeFace.FRONT, 5, 5);
      
      expect(hasObstacleAtStart).toBe(false);
    });

    it('should distribute obstacles across all faces', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      
      // Check that at least some faces have obstacles
      let facesWithObstacles = 0;
      for (let face = 0; face < 6; face++) {
        const obstaclesOnFace = manager.getObstaclesForFace(face);
        if (obstaclesOnFace.length > 0) {
          facesWithObstacles++;
        }
      }
      
      // With 60 obstacles and 6 faces, we expect most/all faces to have some
      expect(facesWithObstacles).toBeGreaterThanOrEqual(4);
    });

    it('should not have duplicate obstacles at same position', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      const allObstacles = manager.getAllObstacles();
      
      const positions = new Set<string>();
      allObstacles.forEach(obstacle => {
        const key = `${obstacle.face},${obstacle.x},${obstacle.y}`;
        expect(positions.has(key)).toBe(false);
        positions.add(key);
      });
    });
  });

  describe('Obstacle checking', () => {
    it('should return false for positions without obstacles', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      
      // Starting position should always be clear
      expect(manager.hasObstacle(CubeFace.FRONT, 5, 5)).toBe(false);
    });

    it('should return true for positions with obstacles', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      const obstacles = manager.getAllObstacles();
      
      // Check at least one obstacle
      expect(obstacles.length).toBeGreaterThan(0);
      
      const firstObstacle = obstacles[0];
      expect(manager.hasObstacle(firstObstacle.face, firstObstacle.x, firstObstacle.y)).toBe(true);
    });

    it('should handle invalid face numbers gracefully', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      
      // Should return false for invalid faces
      expect(manager.hasObstacle(99, 5, 5)).toBe(false);
      expect(manager.hasObstacle(-1, 5, 5)).toBe(false);
    });
  });

  describe('Obstacle retrieval', () => {
    it('should return all obstacles with getAllObstacles', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      const obstacles = manager.getAllObstacles();
      
      expect(Array.isArray(obstacles)).toBe(true);
      expect(obstacles.length).toBe(manager.getObstacleCount());
      
      obstacles.forEach(obstacle => {
        expect(obstacle).toHaveProperty('face');
        expect(obstacle).toHaveProperty('x');
        expect(obstacle).toHaveProperty('y');
        expect(obstacle.face).toBeGreaterThanOrEqual(0);
        expect(obstacle.face).toBeLessThanOrEqual(5);
        expect(obstacle.x).toBeGreaterThanOrEqual(0);
        expect(obstacle.x).toBeLessThanOrEqual(9);
        expect(obstacle.y).toBeGreaterThanOrEqual(0);
        expect(obstacle.y).toBeLessThanOrEqual(9);
      });
    });

    it('should return obstacles for specific face', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      const frontObstacles = manager.getObstaclesForFace(CubeFace.FRONT);
      
      expect(Array.isArray(frontObstacles)).toBe(true);
      frontObstacles.forEach(obstacle => {
        expect(obstacle.face).toBe(CubeFace.FRONT);
      });
    });

    it('should return empty array for face with no obstacles', () => {
      const manager = new ObstacleManager(CubeFace.FRONT, 5, 5);
      
      // Check a face that might not have obstacles (though unlikely with 60 obstacles)
      // This is more of a structural test
      const obstacles = manager.getObstaclesForFace(99 as CubeFace);
      expect(Array.isArray(obstacles)).toBe(true);
      expect(obstacles.length).toBe(0);
    });
  });

  describe('Different starting positions', () => {
    it('should keep different starting positions clear', () => {
      const manager1 = new ObstacleManager(CubeFace.RIGHT, 3, 7);
      expect(manager1.hasObstacle(CubeFace.RIGHT, 3, 7)).toBe(false);

      const manager2 = new ObstacleManager(CubeFace.TOP, 0, 0);
      expect(manager2.hasObstacle(CubeFace.TOP, 0, 0)).toBe(false);

      const manager3 = new ObstacleManager(CubeFace.BACK, 9, 9);
      expect(manager3.hasObstacle(CubeFace.BACK, 9, 9)).toBe(false);
    });
  });

  describe('Obstacle density consistency', () => {
    it('should generate consistent obstacle count across multiple instances', () => {
      const counts: number[] = [];
      
      // Generate multiple instances and check density
      for (let i = 0; i < 5; i++) {
        const manager = new ObstacleManager(CubeFace.FRONT, i, i);
        counts.push(manager.getObstacleCount());
      }
      
      // All counts should be in the acceptable range
      counts.forEach(count => {
        expect(count).toBeGreaterThanOrEqual(55);
        expect(count).toBeLessThanOrEqual(65);
      });
    });
  });
});
