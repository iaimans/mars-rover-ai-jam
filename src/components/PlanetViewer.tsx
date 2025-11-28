import { useEffect, useRef } from 'react';
import { CubePlanet } from '../three/CubePlanet';
import './PlanetViewer.css';

export function PlanetViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<CubePlanet | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the cube planet
    planetRef.current = new CubePlanet(containerRef.current);
    planetRef.current.animate();

    // Cleanup on unmount
    return () => {
      if (planetRef.current) {
        planetRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="planet-viewer">
      <div ref={containerRef} className="canvas-container" />
      <div className="info">
        <h1>Cube Planet</h1>
        <p>A planet in the shape of a cube, rendered with Three.js</p>
      </div>
    </div>
  );
}
