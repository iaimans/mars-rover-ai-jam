import { describe, it, expect, beforeEach } from 'vitest';
import { RoverController, CubeFace, type ObstacleChecker } from './RoverController';

describe('RoverController', () => {
  let rover: RoverController;

  beforeEach(() => {
    rover = new RoverController({
      x: 5,
      y: 5,
      face: CubeFace.FRONT,
      direction: 'N'
    });
  });

  describe('Rotation', () => {
    it('should turn left from N to W', () => {
      const result = rover.turnLeft();
      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.newState.direction).toBe('W');
    });

    it('should turn left from W to S', () => {
      rover.turnLeft();
      const result = rover.turnLeft();
      expect(result.newState.direction).toBe('S');
    });

    it('should turn left from S to E', () => {
      rover.turnLeft();
      rover.turnLeft();
      const result = rover.turnLeft();
      expect(result.newState.direction).toBe('E');
    });

    it('should turn left from E to N', () => {
      rover.turnLeft();
      rover.turnLeft();
      rover.turnLeft();
      const result = rover.turnLeft();
      expect(result.newState.direction).toBe('N');
    });

    it('should turn right from N to E', () => {
      const result = rover.turnRight();
      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.newState.direction).toBe('E');
    });

    it('should turn right from E to S', () => {
      rover.turnRight();
      const result = rover.turnRight();
      expect(result.newState.direction).toBe('S');
    });

    it('should turn right from S to W', () => {
      rover.turnRight();
      rover.turnRight();
      const result = rover.turnRight();
      expect(result.newState.direction).toBe('W');
    });

    it('should turn right from W to N', () => {
      rover.turnRight();
      rover.turnRight();
      rover.turnRight();
      const result = rover.turnRight();
      expect(result.newState.direction).toBe('N');
    });
  });

  describe('Movement within a face', () => {
    it('should move forward when facing North', () => {
      const result = rover.moveForward();
      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.newState.y).toBe(4);
      expect(result.newState.x).toBe(5);
      expect(result.newState.face).toBe(CubeFace.FRONT);
    });

    it('should move backward when facing North', () => {
      const result = rover.moveBackward();
      expect(result.success).toBe(true);
      expect(result.newState.y).toBe(6);
      expect(result.newState.x).toBe(5);
    });

    it('should move forward when facing East', () => {
      rover.turnRight(); // Face East
      const result = rover.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.x).toBe(6);
      expect(result.newState.y).toBe(5);
    });

    it('should move forward when facing South', () => {
      rover.turnRight();
      rover.turnRight(); // Face South
      const result = rover.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.y).toBe(6);
      expect(result.newState.x).toBe(5);
    });

    it('should move forward when facing West', () => {
      rover.turnLeft(); // Face West
      const result = rover.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.x).toBe(4);
      expect(result.newState.y).toBe(5);
    });
  });

  describe('Face transitions', () => {
    it('should transition from FRONT to TOP when moving north off edge', () => {
      // Move to north edge of FRONT
      const roverAtEdge = new RoverController({
        x: 5,
        y: 0,
        face: CubeFace.FRONT,
        direction: 'N'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.TOP);
      expect(result.newState.y).toBe(9);
      expect(result.newState.x).toBe(5);
    });

    it('should transition from FRONT to BOTTOM when moving south off edge', () => {
      const roverAtEdge = new RoverController({
        x: 5,
        y: 9,
        face: CubeFace.FRONT,
        direction: 'S'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.BOTTOM);
      expect(result.newState.y).toBe(0);
    });

    it('should transition from FRONT to LEFT when moving west off edge', () => {
      const roverAtEdge = new RoverController({
        x: 0,
        y: 5,
        face: CubeFace.FRONT,
        direction: 'W'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.LEFT);
      expect(result.newState.x).toBe(9);
    });

    it('should transition from FRONT to RIGHT when moving east off edge', () => {
      const roverAtEdge = new RoverController({
        x: 9,
        y: 5,
        face: CubeFace.FRONT,
        direction: 'E'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.RIGHT);
      expect(result.newState.x).toBe(0);
    });

    it('should transition from RIGHT to TOP with orientation change', () => {
      const roverAtEdge = new RoverController({
        x: 5,
        y: 0,
        face: CubeFace.RIGHT,
        direction: 'N'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.TOP);
      expect(result.newState.direction).toBe('E');
    });

    it('should transition from TOP to FRONT when moving south', () => {
      const roverAtEdge = new RoverController({
        x: 5,
        y: 9,
        face: CubeFace.TOP,
        direction: 'S'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.FRONT);
      expect(result.newState.y).toBe(0);
    });

    it('should transition from LEFT to BACK when moving west', () => {
      const roverAtEdge = new RoverController({
        x: 0,
        y: 5,
        face: CubeFace.LEFT,
        direction: 'W'
      });
      const result = roverAtEdge.moveForward();
      expect(result.success).toBe(true);
      expect(result.newState.face).toBe(CubeFace.BACK);
      expect(result.newState.x).toBe(9);
    });
  });

  describe('Obstacle detection', () => {
    it('should block movement when obstacle is present', () => {
      const obstacleChecker: ObstacleChecker = {
        hasObstacle: (face: number, x: number, y: number) => {
          return face === CubeFace.FRONT && x === 5 && y === 4;
        }
      };
      
      rover.setObstacleChecker(obstacleChecker);
      const result = rover.moveForward(); // Try to move to (5, 4)
      
      expect(result.success).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.newState.x).toBe(5);
      expect(result.newState.y).toBe(5); // Should not have moved
      expect(result.newState.face).toBe(CubeFace.FRONT);
    });

    it('should allow movement when no obstacle is present', () => {
      const obstacleChecker: ObstacleChecker = {
        hasObstacle: () => false
      };
      
      rover.setObstacleChecker(obstacleChecker);
      const result = rover.moveForward();
      
      expect(result.success).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.newState.y).toBe(4);
    });

    it('should block movement at face transitions if obstacle is present', () => {
      const obstacleChecker: ObstacleChecker = {
        hasObstacle: (face: number, x: number, y: number) => {
          return face === CubeFace.TOP && x === 5 && y === 9;
        }
      };
      
      const roverAtEdge = new RoverController({
        x: 5,
        y: 0,
        face: CubeFace.FRONT,
        direction: 'N'
      });
      
      roverAtEdge.setObstacleChecker(obstacleChecker);
      const result = roverAtEdge.moveForward();
      
      expect(result.success).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.newState.face).toBe(CubeFace.FRONT); // Should remain on FRONT
    });
  });

  describe('Animation flag', () => {
    it('should start with isAnimating as false', () => {
      expect(rover.isAnimating).toBe(false);
    });

    it('should allow setting isAnimating flag', () => {
      rover.isAnimating = true;
      expect(rover.isAnimating).toBe(true);
      
      rover.isAnimating = false;
      expect(rover.isAnimating).toBe(false);
    });
  });

  describe('State management', () => {
    it('should return a copy of the state', () => {
      const state1 = rover.getState();
      const state2 = rover.getState();
      
      expect(state1).toEqual(state2);
      expect(state1).not.toBe(state2); // Different object references
    });

    it('should not allow external modification of state', () => {
      const state = rover.getState();
      state.x = 99;
      
      const newState = rover.getState();
      expect(newState.x).toBe(5); // Should still be original value
    });
  });
});
