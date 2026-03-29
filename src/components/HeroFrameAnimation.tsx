import { useEffect, useRef, useCallback, useState } from "react";
import "./HeroFrameAnimation.css";

// ─── Configuration ───
const FRAME_COUNT = 144;
const FRAME_PATH = "/sequence1/ezgif-frame-";
const FRAME_EXT = ".jpg";
const CRITICAL_BATCH = 20;
const BG_BATCH = 8;
const BG_DELAY = 30;

// Parallax config
const PARALLAX_STRENGTH = 80; // px of vertical parallax shift

const getFrameSrc = (i: number) => {
  return `${FRAME_PATH}${String(i).padStart(3, "0")}${FRAME_EXT}`;
};

const HeroFrameAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));
  const loadedRef = useRef<boolean[]>(new Array(FRAME_COUNT).fill(false));
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const parallaxYRef = useRef(0);
  const targetParallaxYRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // ─── Draw frame at full DPR quality with cover-fit ───
  const drawFrame = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (lastDrawnRef.current === idx) return;
    if (!loadedRef.current[idx]) return;

    const img = imagesRef.current[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    lastDrawnRef.current = idx;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Cover-fit
    const scale = Math.max(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  // ─── Animation loop: lerp frames + parallax ───
  const animate = useCallback(() => {
    const cur = currentFrameRef.current;
    const tgt = targetFrameRef.current;
    const diff = Math.abs(tgt - cur);
    const speed = diff > 5 ? 0.18 : 0.1;

    currentFrameRef.current = lerp(cur, tgt, speed);
    const frame = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrameRef.current)));
    drawFrame(frame);

    // Smooth parallax movement
    parallaxYRef.current = lerp(parallaxYRef.current, targetParallaxYRef.current, 0.08);
    const inner = innerRef.current;
    if (inner) {
      inner.style.transform = `translate3d(0, ${parallaxYRef.current}px, 0)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [drawFrame]);

  // ─── Resize canvas at full DPR ───
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    lastDrawnRef.current = -1;
    drawFrame(Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrameRef.current))));
  }, [drawFrame]);

  // ─── Scroll handler: frame mapping + parallax ───
  const onScroll = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const viewH = window.innerHeight;

    // Frame mapping: wrapper entering → leaving viewport
    const start = viewH;
    const end = -rect.height;
    const rawProgress = (start - rect.top) / (start - end);
    const clamped = Math.max(0, Math.min(1, rawProgress));
    targetFrameRef.current = clamped * (FRAME_COUNT - 1);

    // Parallax: map scroll position to vertical offset
    // Center point = 0.5 → no shift; 0 → shift up; 1 → shift down
    const parallaxProgress = (start - rect.top) / (start - end);
    const parallaxClamped = Math.max(0, Math.min(1, parallaxProgress));
    // Map 0→1 to -STRENGTH → +STRENGTH
    targetParallaxYRef.current = (parallaxClamped - 0.5) * 2 * PARALLAX_STRENGTH;
  }, []);

  // ─── Multi-phase preloading ───
  useEffect(() => {
    let aborted = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const loadImg = (i: number): Promise<void> =>
      new Promise((resolve) => {
        if (loadedRef.current[i]) { resolve(); return; }
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          loadedRef.current[i] = true;
          setProgress((p) => p + 1);
          resolve();
        };
        img.onerror = () => {
          const r = new Image();
          r.onload = () => { imagesRef.current[i] = r; loadedRef.current[i] = true; setProgress((p) => p + 1); resolve(); };
          r.onerror = () => { loadedRef.current[i] = true; setProgress((p) => p + 1); resolve(); };
          r.src = getFrameSrc(i + 1);
        };
        img.src = getFrameSrc(i + 1);
        imagesRef.current[i] = img;
      });

    const run = async () => {
      // Phase 1: critical
      const critical = Array.from({ length: Math.min(CRITICAL_BATCH, FRAME_COUNT) }, (_, i) => i);
      await Promise.all(critical.map(loadImg));
      if (aborted) return;
      setReady(true);

      // Phase 2: background
      for (let b = CRITICAL_BATCH; b < FRAME_COUNT; b += BG_BATCH) {
        if (aborted) return;
        const batch = Array.from({ length: Math.min(BG_BATCH, FRAME_COUNT - b) }, (_, j) => b + j);
        await Promise.all(batch.map(loadImg));
        await new Promise<void>((r) => { const id = setTimeout(r, BG_DELAY); timeouts.push(id); });
      }
    };

    run();
    return () => { aborted = true; timeouts.forEach(clearTimeout); };
  }, []);

  // ─── Start animation + scroll listener once ready ───
  useEffect(() => {
    if (!ready) return;

    resizeCanvas();
    drawFrame(0);
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, resizeCanvas, animate, onScroll, drawFrame]);

  const pct = Math.round((progress / FRAME_COUNT) * 100);

  return (
    <div ref={wrapperRef} className="hero-frame-wrapper">
      {/* Inner div extends beyond bounds and has parallax transform */}
      <div ref={innerRef} className="hero-frame-inner">
        <canvas ref={canvasRef} className="hero-frame-canvas" />
      </div>

      {/* Loading overlay */}
      {!ready && (
        <div className="hero-frame-loader">
          <div className="hero-frame-loader-inner">
            <div className="hero-frame-spinner" />
            <div className="hero-frame-loader-bar">
              <div className="hero-frame-loader-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="hero-frame-loader-text">{pct}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroFrameAnimation;
