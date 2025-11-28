/**
 * RoverController - Isolated Mars Rover navigation algorithm
 * 
 * Manages rover state (position, direction, face) on a cube planet with 10x10 grid per face.
 * Handles movement, rotation, face transitions, and obstacle detection.
 */

export type Direction = 'N' | 'S' | 'E' | 'W';

export const CubeFace = {
  FRONT: 0,
  RIGHT: 1,
  BACK: 2,
  LEFT: 3,
  TOP: 4,
  BOTTOM: 5
} as const;

export type CubeFace = typeof CubeFace[keyof typeof CubeFace];

export interface RoverState {
  x: number;          // 0-9 (0,0 is top-left)
  y: number;          // 0-9
  face: CubeFace;     // Current cube face
  direction: Direction; // Cardinal direction relative to face
}

export interface MoveResult {
  success: boolean;   // Command executed successfully
  blocked: boolean;   // Movement blocked by obstacle
  newState: RoverState; // Resulting rover state
}

export interface ObstacleChecker {
  hasObstacle(face: number, x: number, y: number): boolean;
}

const GRID_SIZE = 10;

export class RoverController {
  private state: RoverState;
  private obstacleChecker: ObstacleChecker | null = null;
  private _isAnimating = false;

  constructor(initialState: RoverState) {
    this.state = { ...initialState };
  }

  public setObstacleChecker(checker: ObstacleChecker): void {
    this.obstacleChecker = checker;
  }

  public getState(): RoverState {
    return { ...this.state };
  }

  public get isAnimating(): boolean {
    return this._isAnimating;
  }

  public set isAnimating(value: boolean) {
    this._isAnimating = value;
  }

  /**
   * Turn rover 90° left (counterclockwise)
   */
  public turnLeft(): MoveResult {
    const directionMap: Record<Direction, Direction> = {
      'N': 'W',
      'W': 'S',
      'S': 'E',
      'E': 'N'
    };

    this.state.direction = directionMap[this.state.direction];
    return {
      success: true,
      blocked: false,
      newState: this.getState()
    };
  }

  /**
   * Turn rover 90° right (clockwise)
   */
  public turnRight(): MoveResult {
    const directionMap: Record<Direction, Direction> = {
      'N': 'E',
      'E': 'S',
      'S': 'W',
      'W': 'N'
    };

    this.state.direction = directionMap[this.state.direction];
    return {
      success: true,
      blocked: false,
      newState: this.getState()
    };
  }

  /**
   * Move rover forward in current direction
   */
  public moveForward(): MoveResult {
    return this.move(1);
  }

  /**
   * Move rover backward in current direction
   */
  public moveBackward(): MoveResult {
    return this.move(-1);
  }

  /**
   * Core movement logic with face transitions and obstacle detection
   */
  private move(steps: number): MoveResult {
    const { x, y, face, direction } = this.state;
    
    // Calculate intended next position
    let newX = x;
    let newY = y;
    let newFace = face;
    let newDirection = direction;

    // Determine movement delta based on direction
    const forward = steps > 0;
    switch (direction) {
      case 'N':
        newY = y + (forward ? -1 : 1);
        break;
      case 'S':
        newY = y + (forward ? 1 : -1);
        break;
      case 'E':
        newX = x + (forward ? 1 : -1);
        break;
      case 'W':
        newX = x + (forward ? -1 : 1);
        break;
    }

    // Check if we need to transition to another face
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      const transition = this.calculateFaceTransition(face, direction, newX, newY);
      newFace = transition.face;
      newX = transition.x;
      newY = transition.y;
      newDirection = transition.direction;
    }

    // Check for obstacles
    if (this.obstacleChecker && this.obstacleChecker.hasObstacle(newFace, newX, newY)) {
      return {
        success: false,
        blocked: true,
        newState: this.getState() // Return current state unchanged
      };
    }

    // Update state
    this.state.x = newX;
    this.state.y = newY;
    this.state.face = newFace;
    this.state.direction = newDirection;

    return {
      success: true,
      blocked: false,
      newState: this.getState()
    };
  }

  /**
   * Calculate face transition when rover moves off edge
   * Uses cube topology to determine adjacent face and transform coordinates/orientation
   */
  private calculateFaceTransition(
    currentFace: CubeFace,
    exitDirection: Direction,
    newX: number,
    newY: number
  ): { face: CubeFace; x: number; y: number; direction: Direction } {
    const max = GRID_SIZE - 1;

    // Cube face adjacency and orientation mapping
    // Each face has 4 edges (N, S, E, W) connecting to specific adjacent faces
    // When crossing an edge, coordinates and direction must be transformed
    
    switch (currentFace) {
      case CubeFace.FRONT:
        if (newY < 0) { // Exit North -> TOP
          return { face: CubeFace.TOP, x: newX, y: max, direction: exitDirection };
        } else if (newY >= GRID_SIZE) { // Exit South -> BOTTOM
          return { face: CubeFace.BOTTOM, x: newX, y: 0, direction: exitDirection };
        } else if (newX < 0) { // Exit West -> LEFT
          return { face: CubeFace.LEFT, x: max, y: newY, direction: exitDirection };
        } else { // Exit East -> RIGHT
          return { face: CubeFace.RIGHT, x: 0, y: newY, direction: exitDirection };
        }

      case CubeFace.RIGHT:
        if (newY < 0) { // Exit North -> TOP
          return { face: CubeFace.TOP, x: max, y: max - newX, direction: this.rotateDirection(exitDirection, 1) };
        } else if (newY >= GRID_SIZE) { // Exit South -> BOTTOM
          return { face: CubeFace.BOTTOM, x: max, y: newX, direction: this.rotateDirection(exitDirection, -1) };
        } else if (newX < 0) { // Exit West -> FRONT
          return { face: CubeFace.FRONT, x: max, y: newY, direction: exitDirection };
        } else { // Exit East -> BACK
          return { face: CubeFace.BACK, x: 0, y: newY, direction: exitDirection };
        }

      case CubeFace.BACK:
        if (newY < 0) { // Exit North -> TOP
          return { face: CubeFace.TOP, x: max - newX, y: 0, direction: this.rotateDirection(exitDirection, 2) };
        } else if (newY >= GRID_SIZE) { // Exit South -> BOTTOM
          return { face: CubeFace.BOTTOM, x: max - newX, y: max, direction: this.rotateDirection(exitDirection, 2) };
        } else if (newX < 0) { // Exit West -> RIGHT
          return { face: CubeFace.RIGHT, x: max, y: newY, direction: exitDirection };
        } else { // Exit East -> LEFT
          return { face: CubeFace.LEFT, x: 0, y: newY, direction: exitDirection };
        }

      case CubeFace.LEFT:
        if (newY < 0) { // Exit North -> TOP
          return { face: CubeFace.TOP, x: 0, y: newX, direction: this.rotateDirection(exitDirection, -1) };
        } else if (newY >= GRID_SIZE) { // Exit South -> BOTTOM
          return { face: CubeFace.BOTTOM, x: 0, y: max - newX, direction: this.rotateDirection(exitDirection, 1) };
        } else if (newX < 0) { // Exit West -> BACK
          return { face: CubeFace.BACK, x: max, y: newY, direction: exitDirection };
        } else { // Exit East -> FRONT
          return { face: CubeFace.FRONT, x: 0, y: newY, direction: exitDirection };
        }

      case CubeFace.TOP:
        if (newY < 0) { // Exit North -> BACK
          return { face: CubeFace.BACK, x: max - newX, y: 0, direction: this.rotateDirection(exitDirection, 2) };
        } else if (newY >= GRID_SIZE) { // Exit South -> FRONT
          return { face: CubeFace.FRONT, x: newX, y: 0, direction: exitDirection };
        } else if (newX < 0) { // Exit West -> LEFT
          return { face: CubeFace.LEFT, x: newY, y: 0, direction: this.rotateDirection(exitDirection, 1) };
        } else { // Exit East -> RIGHT
          return { face: CubeFace.RIGHT, x: max - newY, y: 0, direction: this.rotateDirection(exitDirection, -1) };
        }

      case CubeFace.BOTTOM:
        if (newY < 0) { // Exit North -> FRONT
          return { face: CubeFace.FRONT, x: newX, y: max, direction: exitDirection };
        } else if (newY >= GRID_SIZE) { // Exit South -> BACK
          return { face: CubeFace.BACK, x: max - newX, y: max, direction: this.rotateDirection(exitDirection, 2) };
        } else if (newX < 0) { // Exit West -> LEFT
          return { face: CubeFace.LEFT, x: max - newY, y: max, direction: this.rotateDirection(exitDirection, -1) };
        } else { // Exit East -> RIGHT
          return { face: CubeFace.RIGHT, x: newY, y: max, direction: this.rotateDirection(exitDirection, 1) };
        }

      default:
        return { face: currentFace, x: newX, y: newY, direction: exitDirection };
    }
  }

  /**
   * Rotate a direction by 90° steps
   * @param direction Current direction
   * @param steps Number of 90° clockwise rotations (negative for counterclockwise)
   */
  private rotateDirection(direction: Direction, steps: number): Direction {
    const directions: Direction[] = ['N', 'E', 'S', 'W'];
    const currentIndex = directions.indexOf(direction);
    const newIndex = (currentIndex + steps + 4) % 4;
    return directions[newIndex];
  }
}
