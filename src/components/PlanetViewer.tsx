import { useEffect, useRef, useState } from 'react';
import { CubePlanet } from '../three/CubePlanet';
import { RoverController, CubeFace, type RoverState } from '../rover/RoverController';
import { ObstacleManager } from '../rover/ObstacleManager';
import './PlanetViewer.css';

const FACE_NAMES: Record<CubeFace, string> = {
  [CubeFace.FRONT]: 'Front',
  [CubeFace.RIGHT]: 'Right',
  [CubeFace.BACK]: 'Back',
  [CubeFace.LEFT]: 'Left',
  [CubeFace.TOP]: 'Top',
  [CubeFace.BOTTOM]: 'Bottom'
};

export function PlanetViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<CubePlanet | null>(null);
  const roverRef = useRef<RoverController | null>(null);
  const obstaclesRef = useRef<ObstacleManager | null>(null);
  
  const [roverState, setRoverState] = useState<RoverState>({
    x: 5,
    y: 5,
    face: CubeFace.FRONT,
    direction: 'N'
  });
  const [collisionWarning, setCollisionWarning] = useState(false);
  const [showBorderPulse, setShowBorderPulse] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the cube planet
    planetRef.current = new CubePlanet(containerRef.current);
    planetRef.current.animate();

    // Initialize obstacles (starting at Front face, position 5,5)
    obstaclesRef.current = new ObstacleManager(CubeFace.FRONT, 5, 5);
    const obstacles = obstaclesRef.current.getAllObstacles();
    planetRef.current.setObstacles(obstacles);

    // Initialize rover controller
    roverRef.current = new RoverController({
      x: 5,
      y: 5,
      face: CubeFace.FRONT,
      direction: 'N'
    });
    roverRef.current.setObstacleChecker(obstaclesRef.current);

    // Initialize rover visual
    planetRef.current.initializeRover(CubeFace.FRONT, 5, 5, 'N');

    // Cleanup on unmount
    return () => {
      if (planetRef.current) {
        planetRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore input during animation
      if (!roverRef.current || !planetRef.current || roverRef.current.isAnimating) {
        return;
      }

      let result;
      let duration = 0;

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          result = roverRef.current.moveForward();
          duration = 400;
          break;
        case 's':
        case 'arrowdown':
          result = roverRef.current.moveBackward();
          duration = 400;
          break;
        case 'a':
        case 'arrowleft':
          result = roverRef.current.turnLeft();
          duration = 250;
          break;
        case 'd':
        case 'arrowright':
          result = roverRef.current.turnRight();
          duration = 250;
          break;
        default:
          return;
      }

      // Prevent default browser behavior for arrow keys
      event.preventDefault();

      if (result.blocked) {
        // Show collision feedback
        setCollisionWarning(true);
        setShowBorderPulse(true);
        
        // Spawn particles at collision location
        const state = roverRef.current.getState();
        planetRef.current.spawnCollisionParticles(state.face, state.x, state.y);

        // Hide warning after 2 seconds
        setTimeout(() => setCollisionWarning(false), 2000);
        
        // Remove border pulse after animation
        setTimeout(() => setShowBorderPulse(false), 500);
      } else if (result.success) {
        // Update rover state
        setRoverState(result.newState);

        // Set animation flag
        roverRef.current.isAnimating = true;

        // Animate rover to new position
        planetRef.current.animateRoverTo(
          result.newState.face,
          result.newState.x,
          result.newState.y,
          result.newState.direction,
          duration,
          () => {
            // Clear animation flag when complete
            if (roverRef.current) {
              roverRef.current.isAnimating = false;
            }
          }
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`planet-viewer ${showBorderPulse ? 'collision-pulse' : ''}`}>
      <div ref={containerRef} className="canvas-container" />
      
      <div className="info">
        <h1>Mars Rover - Cube Planet</h1>
        <p>Navigate the rover across the cube planet</p>
      </div>

      <div className="controls-info">
        <h3>Controls</h3>
        <p>W/↑ - Move Forward</p>
        <p>S/↓ - Move Backward</p>
        <p>A/← - Turn Left</p>
        <p>D/→ - Turn Right</p>
      </div>

      <div className="rover-status">
        <h3>Rover Status</h3>
        <p><strong>Face:</strong> {FACE_NAMES[roverState.face]}</p>
        <p><strong>Position:</strong> ({roverState.x}, {roverState.y})</p>
        <p><strong>Direction:</strong> {roverState.direction}</p>
      </div>

      {collisionWarning && (
        <div className="collision-warning">
          ⚠️ Obstacle detected! Cannot move forward.
        </div>
      )}
    </div>
  );
}
