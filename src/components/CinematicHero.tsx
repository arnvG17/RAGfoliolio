import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import "./CinematicHero.css";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config ───
const FRAME_COUNT = 144;
const FRAME_PATH = "/sequence1/ezgif-frame-";
const FRAME_EXT = ".jpg";
const CRITICAL_BATCH = 20;
const BG_BATCH = 8;
const BG_DELAY = 30;

const getFrameSrc = (i: number) =>
  `${FRAME_PATH}${String(i).padStart(3, "0")}${FRAME_EXT}`;

// =================== CinematicHero ===================
const CinematicHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));
  const loadedRef = useRef<boolean[]>(new Array(FRAME_COUNT).fill(false));
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const rafRef = useRef<number | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

    // Use Math.min to constrain the frame proportionally so the inside car remains unclipped
    const scale = Math.min(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);

    // 1. Draw blurred, scaled-up background to seamlessly fill the edges with native frame lighting
    ctx.globalAlpha = 1.0;
    ctx.filter = 'blur(60px)';
    const coverScale = Math.max(cw / iw, ch / ih);
    const cSw = iw * coverScale * 1.2; // 120% scale to prevent edge bleeding on large blurs
    const cSh = ih * coverScale * 1.2;
    const cSx = (cw - cSw) / 2;
    const cSy = (ch - cSh) / 2;
    ctx.drawImage(img, cSx, cSy, cSw, cSh);

    // 2. Draw actual unclipped frame, shifted left to fix the car's off-center position in the raw images
    ctx.filter = 'none';
    const xOffset = sw * -0.06; // Shift left by 6% to correct inherent rightward asymmetry
    ctx.drawImage(img, sx + xOffset, sy, sw, sh);

    // Remove any hardcoded background color that might clash
    if (canvas.parentElement) {
      canvas.parentElement.style.backgroundColor = 'transparent';
    }
  }, []);

  const animate = useCallback(() => {
    const cur = currentFrameRef.current;
    const tgt = targetFrameRef.current;
    const diff = Math.abs(tgt - cur);
    const speed = diff > 5 ? 0.2 : 0.12;

    currentFrameRef.current = lerp(cur, tgt, speed);
    const frame = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrameRef.current)));
    drawFrame(frame);
    rafRef.current = requestAnimationFrame(animate);
  }, [drawFrame]);

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
      const critical = Array.from({ length: Math.min(CRITICAL_BATCH, FRAME_COUNT) }, (_, i) => i);
      await Promise.all(critical.map(loadImg));
      if (aborted) return;
      setReady(true);

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

  useEffect(() => {
    if (!ready) return;

    resizeCanvas();
    drawFrame(0);
    window.addEventListener("resize", resizeCanvas);
    rafRef.current = requestAnimationFrame(animate);

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=400%",
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress; 
        targetFrameRef.current = p * (FRAME_COUNT - 1);

        // Map scroll directly to left container transform
        const leftScroll = document.getElementById("cinematic-left-scroll");
        if (leftScroll) {
          // Translate from 0 to -100vh (which shifts exact 1 window height up)
          // 400% scroll -> 100vh movement = very smooth and slow parallax!
          const maxTranslate = window.innerHeight;
          leftScroll.style.transform = `translate3d(0, -${p * maxTranslate}px, 0)`;
        }
      },
    });

    triggerRef.current = trigger;

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, resizeCanvas, animate, drawFrame]);

  const pct = Math.round((progress / FRAME_COUNT) * 100);

  return (
    <section ref={sectionRef} className="cinematic-section" id="home">
      {/* ─── LEFT: Seamlessly scrolling text container ─── */}
      <div className="cinematic-left">
        <div id="cinematic-left-scroll" className="cinematic-left-scroll">
          
          {/* Hero Panel (takes 100vh height) */}
          <div className="cinematic-panel cinematic-hero-panel">
            <div className="cinematic-hero-greeting">
              <span className="text-xl">`</span>
            </div>

            <h1 className="cinematic-hero-headline">
              <span className="text-foreground">Crafting </span>
              <span className="text-accent">purpose driven</span>
              <br />
              <span className="text-accent">experiences </span>
              <span className="text-foreground">that inspire</span>
              <br />
              <span className="text-foreground">& engage.</span>
            </h1>

            <div className="cinematic-hero-links">
              <a href="https://www.linkedin.com/in/arnav-gawandi-2ba6b1324/" target="_blank" rel="noopener noreferrer" className="cinematic-social-link">
                LINKEDIN <ArrowUpRight className="w-3 h-3" />
              </a>
              <a href="https://github.com/arnvG17" target="_blank" rel="noopener noreferrer" className="cinematic-social-link">
                GITHUB <ArrowUpRight className="w-3 h-3" />
              </a>
              <a href="https://leetcode.com/u/ArnV17/" target="_blank" rel="noopener noreferrer" className="cinematic-social-link">
                LEETCODE <ArrowUpRight className="w-3 h-3" />
              </a>
              <a href="mailto:arnavog@gmail.com" className="cinematic-social-link">
                GMAIL <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* About Panel (takes 100vh height, naturally below Hero) */}
          <div className="cinematic-panel cinematic-about-panel">
            <div className="cinematic-about-badge">
              <span className="text-accent">✦</span>
              <span className="cinematic-about-label">About Me</span>
            </div>

            <p className="cinematic-about-text">
              I'm{" "}
              <span className="font-medium text-white">Arnav Gawandi</span>, a{" "}
              <span className="font-medium text-accent">web designer & developer</span> specializing in{" "}
              <span className="font-medium text-white">Web3 development</span> and{" "}
              <span className="font-medium text-accent">AI integration</span>. I approach
              every project as if crafting a{" "}
              <span className="font-medium text-white">bespoke home</span>, leveraging{" "}
              <span className="font-medium text-accent">agentic workflows</span> to build
              intelligent solutions. My goal is to create digital spaces that are{" "}
              <span className="font-medium text-white">visually striking</span> yet{" "}
              <span className="font-medium text-accent">personal, functional, and welcoming</span>,
              a place where your <span className="font-medium text-white">brand truly lives</span>{" "}
              and connects with its audience.
            </p>
          </div>

        </div>
      </div>

      {/* ─── RIGHT: Pinned frame animation canvas ─── */}
      <div className="cinematic-right">
        <div className="cinematic-canvas-wrapper">
          <canvas ref={canvasRef} className="cinematic-canvas" />

          {/* Loading overlay */}
          {!ready && (
            <div className="cinematic-loader">
              <div className="cinematic-loader-inner">
                <div className="cinematic-spinner" />
                <div className="cinematic-loader-bar">
                  <div className="cinematic-loader-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="cinematic-loader-text">{pct}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CinematicHero;
