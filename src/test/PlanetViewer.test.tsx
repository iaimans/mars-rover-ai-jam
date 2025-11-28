import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanetViewer } from '../components/PlanetViewer';

describe('PlanetViewer', () => {
  it('renders the planet viewer component', () => {
    render(<PlanetViewer />);
    expect(screen.getByText('Cube Planet')).toBeInTheDocument();
  });

  it('displays the description text', () => {
    render(<PlanetViewer />);
    expect(screen.getByText(/A planet in the shape of a cube/i)).toBeInTheDocument();
  });
});
