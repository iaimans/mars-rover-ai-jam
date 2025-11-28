
## Cube Planet Mars Rover - 3D Real-time Navigation

You are given the initial starting point (x, y, face) of a rover on a cube planet and the direction it is facing (N, S, E, W) relative to that face.

### Core Mechanics

- **Cube Planet**: The planet is a 3D cube with 6 faces. Each face is a grid that the rover can traverse.
- **Real-time Control**: The rover receives commands via keyboard input and moves in real-time.
- **Face Navigation**: The rover can move across face edges, transitioning between adjacent cube faces with proper orientation changes.

### Commands

- **Movement**: 
    - `W` or `↑` - Move forward
    - `S` or `↓` - Move backward
- **Rotation**:
    - `A` or `←` - Turn left (90°)
    - `D` or `→` - Turn right (90°)

### Edge Wrapping (Cube Topology)

When the rover moves off the edge of one face, it transitions to the adjacent face of the cube. The rover's orientation must be recalculated based on the cube's 3D geometry to maintain consistent directional movement.

### Obstacle Detection

- Check for obstacles before each move
- If an obstacle is detected, the rover remains at its current position
- Display a visual or console warning when an obstacle blocks movement
- The rover can continue receiving other commands after hitting an obstacle
