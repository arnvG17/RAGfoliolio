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

    const isMobile = window.innerWidth <= 900;
    const baseScale = isMobile ? 0.8 : 0.85;

    const scale = Math.min(cw / iw, ch / ih) * baseScale;
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = isMobile ? (ch * 0.30) : (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.filter = 'none';
    ctx.drawImage(img, sx, sy, sw, sh);
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
          const r = new Image();
          r.onload = () => { imagesRef.current[i] = r; loadedRef.current[i] = true; setProgress((p) => p + 1); resolve(); };
          r.onerror = () => { loadedRef.current[i] = true; setProgress((p) => p + 1); resolve(); };
          r.src = getFrameSrc(i);
        };
        img.src = getFrameSrc(i);
        imagesRef.current[i] = img;
      });

    const run = async () => {
      const critical1 = Array.from({ length: Math.min(CRITICAL_BATCH, FRAME_COUNT_1) }, (_, i) => i);
      await Promise.all(critical1.map(loadImg));
      if (aborted) return;
      setReady(true);

      for (let b = CRITICAL_BATCH; b < FRAME_COUNT_1; b += BG_BATCH) {
        if (aborted) return;
        const batch = Array.from({ length: Math.min(BG_BATCH, FRAME_COUNT_1 - b) }, (_, j) => b + j);
        await Promise.all(batch.map(loadImg));
        await new Promise<void>((r) => { const id = setTimeout(r, BG_DELAY); timeouts.push(id); });
      }

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

    const isMobile = window.innerWidth <= 900;
    
    // Desktop Scroll Progress Milestones
    const STACK_START = 0.25;          // Hero to About text scroll completes
    const STACK_DRIVE_START = 0.35;    // Tech stack slides into view
    const STACK_DRIVE_END = 0.65;      // Roller coaster loop completed
    const STACK_BACK_END = 0.75;       // Tech stack slides back out to the right
    const EXPERTISE_SCROLL_END = 0.90; // About to Expertise text scroll completes
    const STACK_END = 1.0;             // Next section fully active

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: isMobile ? "bottom bottom" : "+=800%",
      pin: !isMobile,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const p = self.progress;

        if (isMobile) {
          targetFrameRef.current = p * (TOTAL_FRAMES - 1);

          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;

          if (p < 0.75) {
            if (canvasContainer) canvasContainer.style.opacity = "1";
          } else {
            const fadeP = (p - 0.75) / 0.25;
            if (canvasContainer) canvasContainer.style.opacity = String(1 - fadeP);
          }
          return;
        }

        // Desktop logic: Drive the 3D text crawl on the left panel (Expertise panel)
        const expText = document.getElementById("expertise-perspective-text");

        // --- Scroll Phase Control ---
        if (p <= STACK_START) {
          // Phase 1: Vertical scroll of left text panels (Hero -> About, translate 0 to -100vh)
          const scrollProgress = Math.min(1, p / STACK_START);
          targetFrameRef.current = scrollProgress * (FRAME_VERT_END * 0.7);

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${scrollProgress * window.innerHeight}px, 0)`;
            leftScroll.style.opacity = "1";
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.transform = `translate3d(0, 0, 0)`;
            hz.style.opacity = "1";
          }

          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;
          if (canvasContainer) canvasContainer.style.opacity = "1";

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "0";
            further.style.pointerEvents = "none";
          }

          if (expText) expText.style.opacity = "0";
        }
        else if (p <= STACK_DRIVE_START) {
          // Phase 2: Horizontal Slide In (Reveal Tech Stack to the Left)
          const iP = (p - STACK_START) / (STACK_DRIVE_START - STACK_START);
          targetFrameRef.current = (FRAME_VERT_END * 0.7) + iP * 40;

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${window.innerHeight}px, 0)`;
            leftScroll.style.opacity = String(1 - iP);
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.opacity = "1";
            hz.style.transform = `translate3d(-${iP * 100}vw, 0, 0)`;
          }

          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;
          if (canvasContainer) {
            canvasContainer.style.opacity = String(1 - iP);
          }

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "0";
            further.style.pointerEvents = "none";
          }

          if (expText) expText.style.opacity = "0";
        }
        else if (p <= STACK_DRIVE_END) {
          // Phase 3: Pinned Tech Stack & Coaster Loop
          targetFrameRef.current = (FRAME_VERT_END * 0.7) + 40;

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.opacity = "0";
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.opacity = "1";
            hz.style.transform = `translate3d(-100vw, 0, 0)`;
          }

          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;
          if (canvasContainer) {
            canvasContainer.style.opacity = "0";
          }

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "0";
            further.style.pointerEvents = "none";
          }

          if (expText) expText.style.opacity = "0";
        }
        else if (p <= STACK_BACK_END) {
          // Phase 4: Horizontal Slide Back to the Right (Return to main split screen / About section)
          const iP = (p - STACK_DRIVE_END) / (STACK_BACK_END - STACK_DRIVE_END);
          targetFrameRef.current = (FRAME_VERT_END * 0.7) + 40;

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${window.innerHeight}px, 0)`;
            leftScroll.style.opacity = String(iP);
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.opacity = "1";
            hz.style.transform = `translate3d(-${(1 - iP) * 100}vw, 0, 0)`;
          }

          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;
          if (canvasContainer) {
            canvasContainer.style.opacity = String(iP);
          }

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "0";
            further.style.pointerEvents = "none";
          }

          if (expText) expText.style.opacity = "0";
        }
        else if (p <= EXPERTISE_SCROLL_END) {
          // Phase 5: Scroll vertically from About to Expertise (translate -100vh to -200vh)
          const scrollProgress = (p - STACK_BACK_END) / (EXPERTISE_SCROLL_END - STACK_BACK_END);
          targetFrameRef.current = (FRAME_VERT_END * 0.7) + 40 + scrollProgress * 60;

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${window.innerHeight * (1 + scrollProgress)}px, 0)`;
            leftScroll.style.opacity = "1";
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.transform = `translate3d(0, 0, 0)`;
            hz.style.opacity = "1";
          }

          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;
          if (canvasContainer) canvasContainer.style.opacity = "1";

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "0";
            further.style.pointerEvents = "none";
          }

          if (expText) {
            const expP = scrollProgress;
            const yVal = 400 - (expP * 650);
            const rotX = 35 - (expP * 23);
            const opacity = Math.sin(expP * Math.PI);
            expText.style.transform = `rotateX(${rotX}deg) translateY(${yVal}px) translateZ(10px)`;
            expText.style.opacity = String(opacity);
          }
        }
        else {
          // Phase 6: Final Exit (Projects section rises, split screen fades out)
          const iP = (p - EXPERTISE_SCROLL_END) / (STACK_END - EXPERTISE_SCROLL_END);
          const startFrame = (FRAME_VERT_END * 0.7) + 40 + 60;
          targetFrameRef.current = startFrame + iP * (TOTAL_FRAMES - 1 - startFrame);

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.transform = `translate3d(0, 0, 0)`;
            hz.style.opacity = String(1 - iP);
          }

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "1";
            further.style.pointerEvents = "auto";
            further.style.transform = `translateY(${100 - (iP * 100)}vh)`;
          }

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${window.innerHeight * 2}px, 0)`;
            leftScroll.style.opacity = String(1 - iP);
          }

          const heroMain = document.querySelector(".cinematic-h-panel-main") as HTMLElement;
          if (heroMain) {
            heroMain.style.opacity = String(1 - iP);
          }

          if (expText) expText.style.opacity = "0";
        }
      },
      onLeave: () => {
        if (isMobile) return;
        const hero = sectionRef.current;
        if (hero) {
          hero.style.visibility = "hidden";
          hero.style.pointerEvents = "none";
        }
        const further = document.getElementById("further-content");
        if (further) {
          further.style.position = "relative";
          further.style.top = "auto";
          further.style.left = "auto";
          further.style.transform = "none";
          further.style.opacity = "1";
          further.style.pointerEvents = "auto";
        }

        const hz = document.getElementById("cinematic-horizontal");
        if (hz) hz.style.transform = "none";
      },
      onEnterBack: () => {
        if (isMobile) return;
        const hero = sectionRef.current;
        if (hero) {
          hero.style.visibility = "visible";
          hero.style.pointerEvents = "auto";
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
                    LinkedIn <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <a href="https://github.com/arnvG17" target="_blank" rel="noopener noreferrer" className="cinematic-social-link">
                    Github <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <a href="https://leetcode.com/u/ArnV17/" target="_blank" rel="noopener noreferrer" className="cinematic-social-link">
                    Leetcode <ArrowUpRight className="w-3 h-3" />
                  </a>
                  <a href="mailto:arnavog@gmail.com" className="cinematic-social-link">
                    Gmail <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* About Panel */}
              <div id="about" className="cinematic-panel cinematic-about-panel">
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

              {/* Expertise Panel */}
              <div id="expertise" className="cinematic-panel cinematic-expertise-panel">
                <div className="cinematic-about-badge">
                  <span className="text-accent">✦</span>
                  <span className="cinematic-about-label">Expertise</span>
                </div>

                <div
                  className="expertise-perspective-wrapper"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "300px",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    id="expertise-perspective-text"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: "rotateX(15deg) translateY(0px) translateZ(10px)",
                      willChange: "transform, opacity",
                    }}
                    className="w-full max-w-2xl md:max-w-3xl text-center text-3xl md:text-5xl font-bold tracking-tight text-foreground/80 leading-[1.4] uppercase select-none"
                  >
                    EVER SINCE I WAS YOUNG I WANTED TO TURN {" "}
                    <span className="text-accent font-cursive tracking-normal normal-case px-2 drop-shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                      Messy and unstructed Data into Structured Workflows
                    </span>{" "}
                    & COGNITIVE ARCHITECTURES.  INTO  {" "}
                    <span className="text-white font-serif-italic tracking-normal normal-case px-1">
                      autonomous AI agents
                    </span>{" "}
                    THAT REASON, PLAN, AND EXECUTE COMPLEX TASKS. INTEGRATING{" "}
                    <span className="text-accent font-cursive tracking-normal normal-case px-2 drop-shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                      RAG Pipelines
                    </span>
                    , SEMANTIC SEARCH, AND SELF-HEALING LOOPS WITH HIGH-PERFORMANCE{" "}
                    <span className="text-white font-serif-italic tracking-normal normal-case px-1">
                      full-stack systems
                    </span>.
                  </div>
                </div>
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
        <div id="stack" className="cinematic-h-panel cinematic-h-panel-stack">
          <Stack />
        </div>

      </div>
    </section>
  );
};

export default CinematicHero;
