import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Stack from "./Stack";
import "./CinematicHero.css";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config ───
const FRAME_COUNT_1 = 160;
const FRAME_COUNT_2 = 126;
const TOTAL_FRAMES = FRAME_COUNT_1 + FRAME_COUNT_2;

const FRAME_VERT_END = 127; // Frame 128 (0-indexed) of Sequence 1
const FRAME_PATH_1 = "/new-sequence/ezgif-frame-";
const FRAME_PATH_2 = "/sequence2/ezgif-frame-";
const FRAME_EXT = ".jpg";

const CRITICAL_BATCH = 20;
const BG_BATCH = 10;
const BG_DELAY = 25;

const getFrameSrc = (i: number) => {
  if (i < FRAME_COUNT_1) {
    return `${FRAME_PATH_1}${String(i + 1).padStart(3, "0")}${FRAME_EXT}`;
  } else {
    const seq2Idx = i - FRAME_COUNT_1 + 1;
    return `${FRAME_PATH_2}${String(seq2Idx).padStart(3, "0")}${FRAME_EXT}`;
  }
};

// =================== CinematicHero ===================
const CinematicHero = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>(new Array(TOTAL_FRAMES));
  const loadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
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

    // Scale strictly by height to ensure the full car is visible from top to bottom.
    // Using 0.90 to give it a 5% margin at top and bottom (10% total) to prevent clipping.
    const scale = (ch / ih) * 0.90;
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;
    
    ctx.clearRect(0, 0, cw, ch);

    // Removed blurred background logic to prevent "white div" look

    // 2. Draw actual unclipped frame centered
    ctx.filter = 'none';
    ctx.drawImage(img, sx, sy, sw, sh);

    // Remove any hardcoded background color that might clash
    // (Removed as per user request for static off-white background)
  }, []);

  const animate = useCallback(() => {
    const cur = currentFrameRef.current;
    const tgt = targetFrameRef.current;
    const diff = Math.abs(tgt - cur);
    const speed = diff > 5 ? 0.25 : 0.15;

    currentFrameRef.current = lerp(cur, tgt, speed);
    const frame = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameRef.current)));
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
    drawFrame(Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(currentFrameRef.current))));
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
          // Retry logic
          const r = new Image();
          r.onload = () => { imagesRef.current[i] = r; loadedRef.current[i] = true; setProgress((p) => p + 1); resolve(); };
          r.onerror = () => { loadedRef.current[i] = true; setProgress((p) => p + 1); resolve(); };
          r.src = getFrameSrc(i);
        };
        img.src = getFrameSrc(i);
        imagesRef.current[i] = img;
      });

    const run = async () => {
      // Sequence 1 Critical
      const critical1 = Array.from({ length: Math.min(CRITICAL_BATCH, FRAME_COUNT_1) }, (_, i) => i);
      await Promise.all(critical1.map(loadImg));
      if (aborted) return;
      setReady(true);

      // Rest of Sequence 1
      for (let b = CRITICAL_BATCH; b < FRAME_COUNT_1; b += BG_BATCH) {
        if (aborted) return;
        const batch = Array.from({ length: Math.min(BG_BATCH, FRAME_COUNT_1 - b) }, (_, j) => b + j);
        await Promise.all(batch.map(loadImg));
        await new Promise<void>((r) => { const id = setTimeout(r, BG_DELAY); timeouts.push(id); });
      }

      // Sequence 2
      for (let b = FRAME_COUNT_1; b < TOTAL_FRAMES; b += BG_BATCH) {
        if (aborted) return;
        const batch = Array.from({ length: Math.min(BG_BATCH, TOTAL_FRAMES - b) }, (_, j) => b + j);
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

    // Phase 1: frame animation + text scroll (0 → PHASE1_END)
    // Phase 2: horizontal scroll revealing Stack (PHASE1_END → PHASE2_END)
    // Phase 3: top scroll revealing Projects (PHASE2_END → 1.0)
    const PHASE1_END = 0.35;
    const PHASE2_END = 0.70;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=1200%",
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;

        if (p <= PHASE1_END) {
          // ── Phase 1: frame animation + vertical text scroll ──
          const phase1P = p / PHASE1_END;
          targetFrameRef.current = phase1P * FRAME_VERT_END;

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            const maxTranslate = window.innerHeight;
            leftScroll.style.transform = `translate3d(0, -${phase1P * maxTranslate}px, 0)`;
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) hz.style.transform = `translate3d(0, 0, 0)`;

          // Ensure further content section is hidden above
          const further = document.getElementById("further-content");
          if (further) further.style.transform = `translate3d(0, -100%, 0)`;
        } 
        else if (p <= PHASE2_END) {
          // ── Phase 2: horizontal scroll ──
          const phase2P = (p - PHASE1_END) / (PHASE2_END - PHASE1_END);
          targetFrameRef.current = FRAME_VERT_END + phase2P * ( (FRAME_COUNT_1 - 1) - FRAME_VERT_END );

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${window.innerHeight}px, 0)`;
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            const translateX = phase2P * (window.innerWidth * 0.60);
            hz.style.transform = `translate3d(-${translateX}px, 0, 0)`;
          }

          const further = document.getElementById("further-content");
          if (further) further.style.transform = `translate3d(0, -100%, 0)`;
        }
        else {
          // ── Phase 3: Top scroll (revealing Further Content) + Sequence 2 + STACK EXIT ──
          const phase3P = (p - PHASE2_END) / (1 - PHASE2_END);
          targetFrameRef.current = (FRAME_COUNT_1) + phase3P * (FRAME_COUNT_2 - 1);

          // 1. Move stack back to the right (X-axis)
          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            // Translate from -60vw back to 0
            const translateX = (window.innerWidth * 0.60) * (1 - phase3P);
            hz.style.transform = `translate3d(-${translateX}px, 0, 0)`;
          }

          // 2. Reveal Further Content block sliding down from top (Y-axis)
          const further = document.getElementById("further-content");
          if (further) {
            const translateY = -100 + (phase3P * 100);
            further.style.transform = `translate3d(0, ${translateY}%, 0)`;
            further.style.zIndex = "50"; 
            further.style.position = "fixed";
            further.style.top = "0";
            further.style.left = "0";
            further.style.width = "100%";
            further.style.height = "auto";
            further.style.maxHeight = "100vh";
            further.style.overflow = "hidden";
            further.style.background = "hsl(0 0% 6%)";
          }
        }
        
        // Final unpin: smooth handoff to natural page flow
        // Triggers exactly when the curtain reveal is complete
        if (p >= 0.99) {
          const further = document.getElementById("further-content");
          const hz = document.getElementById("cinematic-horizontal");
          const hero = sectionRef.current;
          
          if (hz) hz.style.transform = `translate3d(0, 0, 0)`;
          if (hero) hero.style.opacity = "0"; // Fade out the hero completely at the end

          if (further) {
            further.style.position = "relative";
            further.style.transform = "none";
            further.style.zIndex = "auto";
            further.style.height = "auto";
            further.style.maxHeight = "none";
            further.style.overflow = "visible";
          }
        } else {
          // Ensure hero is visible during the pin
          const hero = sectionRef.current;
          if (hero) hero.style.opacity = "1";
        }
      },
      onLeave: () => {
        // Ensure everything is perfectly relative and in flow when the pin ends
        const further = document.getElementById("further-content");
        const hz = document.getElementById("cinematic-horizontal");
        const hero = sectionRef.current;
        
        if (hero) hero.style.opacity = "0";
        if (hz) hz.style.transform = `translate3d(0, 0, 0)`;
        if (further) {
          further.style.position = "relative";
          further.style.transform = "none";
          further.style.zIndex = "auto";
          further.style.height = "auto";
          further.style.maxHeight = "none";
          further.style.overflow = "visible";
        }
      },
      onEnterBack: () => {
        // Re-apply reveal styles and show hero if scrolling back up into the pin
        const further = document.getElementById("further-content");
        const hero = sectionRef.current;
        if (hero) hero.style.opacity = "1";
        if (further) {
          further.style.position = "fixed";
          further.style.zIndex = "50";
          further.style.maxHeight = "100vh";
          further.style.overflow = "hidden";
        }
      }
    });

    triggerRef.current = trigger;

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, resizeCanvas, animate, drawFrame]);

  const pct = Math.round((progress / TOTAL_FRAMES) * 100);

  return (
    <section ref={sectionRef} className="cinematic-section" id="home">
      <div id="cinematic-horizontal" className="cinematic-horizontal">

        {/* ═══ Panel 1: Original cinematic split-screen ═══ */}
        <div className="cinematic-h-panel cinematic-h-panel-main">

          {/* ─── LEFT: Seamlessly scrolling text container ─── */}
          <div className="cinematic-left">
            <div id="cinematic-left-scroll" className="cinematic-left-scroll">

              {/* Hero Panel */}
              <div className="cinematic-panel cinematic-hero-panel">
                <div className="cinematic-hero-greeting">
                  <span className="text-xl">`</span>
                </div>

                <h1 className="cinematic-hero-headline">
                  <span className="text-foreground">WireFrame </span>
                  <span className="text-foreground">to a </span>
                  <br />
                  <span className="text-accent">Pixel-Perfect </span>
                  <br />
                  <span className="text-accent">Digital Experience</span>
                  <br />
                  <span className="text-foreground">that Inspire & Engage.</span>
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

              {/* About Panel */}
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

        </div>

        {/* ═══ Panel 2: Stack — revealed via horizontal scroll ═══ */}
        <div className="cinematic-h-panel cinematic-h-panel-stack">
          <Stack />
        </div>

      </div>
    </section>
  );
};

export default CinematicHero;
