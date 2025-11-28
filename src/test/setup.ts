import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Three.js WebGLRenderer to avoid WebGL context issues in tests
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    WebGLRenderer: vi.fn(function(this: {
      domElement: HTMLCanvasElement;
      setSize: ReturnType<typeof vi.fn>;
      render: ReturnType<typeof vi.fn>;
      dispose: ReturnType<typeof vi.fn>;
      setPixelRatio: ReturnType<typeof vi.fn>;
      setClearColor: ReturnType<typeof vi.fn>;
    }) {
      this.domElement = document.createElement('canvas');
      this.setSize = vi.fn();
      this.render = vi.fn();
      this.dispose = vi.fn();
      this.setPixelRatio = vi.fn();
      this.setClearColor = vi.fn();
    }),
  };
});

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn(() => {
  // Don't call the callback to avoid infinite loops in tests
  return 1;
});

globalThis.cancelAnimationFrame = vi.fn();
