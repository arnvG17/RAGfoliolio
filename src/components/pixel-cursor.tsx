import React, { useRef, useEffect, useCallback } from 'react';

interface MouseState {
  target: { x: number; y: number };
  current: { x: number; y: number };
}

interface PixelatedCanvasProps {
  className?: string;
}

const PixelatedCanvas: React.FC<PixelatedCanvasProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<MouseState>({
    target: { x: -100, y: -100 },
    current: { x: -100, y: -100 }
  });
  const animationFrameRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const WRef = useRef<number>(32);
  const HRef = useRef<number>(32);

  // Utility functions
  const lerp = (start: number, end: number, t: number): number =>
    start * (1 - t) + end * t;

  const map = (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number =>
    ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Number of logical "pixels" in our pixelated grid
    WRef.current = 32;
    HRef.current = 32;
    canvas.width = WRef.current;
    canvas.height = HRef.current;

    // Scale canvas to fill the screen
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = WRef.current;
    const H = HRef.current;

    const isDark = document.documentElement.classList.contains('dark');
    const overlayColor = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)';

    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, W, H);

    // Smoothly interpolate mouse position
    const mouse = mouseRef.current;
    mouse.current.x = lerp(mouse.current.x, mouse.target.x, 0.12);
    mouse.current.y = lerp(mouse.current.y, mouse.target.y, 0.12);

    // Draw cursor circle
    ctx.beginPath();
    ctx.arc(mouse.current.x, mouse.current.y, 100 / W, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    ctx.fill();

    timeRef.current += 0.01;
    animationFrameRef.current = requestAnimationFrame(render);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const W = WRef.current;
    const H = HRef.current;
    mouseRef.current.target.x = map(event.clientX, 0, window.innerWidth, 0, W);
    mouseRef.current.target.y = map(event.clientY, 0, window.innerHeight, 0, H);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasBackground = () => {
      const isDark = document.documentElement.classList.contains('dark');
      canvas.style.setProperty('--canvas-bg', isDark ? 'black' : 'white');
    };

    updateCanvasBackground();
    resize();
    animationFrameRef.current = requestAnimationFrame(render);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    const observer = new MutationObserver(updateCanvasBackground);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, [resize, handleMouseMove, render]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{
        zIndex: -1, // background layer
        imageRendering: 'pixelated' // keeps sharp edges
      }}
    />
  );
};

export { PixelatedCanvas };
