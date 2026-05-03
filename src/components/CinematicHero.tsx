import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Stack from "./Stack";
import Noise from "./Noise";
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
    const isMobile = window.innerWidth <= 900;
    const baseScale = isMobile ? 0.8 : 0.85; // Better size for mobile background
    
    const scale = Math.min(cw / iw, ch / ih) * baseScale;
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2; // Perfect vertical centering for mobile and desktop
    
    ctx.clearRect(0, 0, cw, ch);
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

    const isMobile = window.innerWidth <= 900;
    const PHASE1_END = 0.35; // Hero -> About -> Expertise
    const INTERACTION_END = 0.55; // Bounce/Stack

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: isMobile 
        ? () => {
            const projectsEl = document.getElementById("projects");
            return projectsEl ? projectsEl.offsetTop : "bottom bottom";
          }
        : "+=800%", 
      pin: !isMobile,
      scrub: isMobile ? 0.5 : 1.2, 
      anticipatePin: 1,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onUpdate: (self) => {
        const p = self.progress;

        if (isMobile) {
          // Linear continuous car animation linked to the journey until projects
          targetFrameRef.current = p * (TOTAL_FRAMES - 1);

          // Ensure full visibility throughout the sequence
          const canvasContainer = document.querySelector(".cinematic-right") as HTMLElement;
          if (canvasContainer) {
            canvasContainer.style.opacity = "1.0";
          }
          return;
        }

        // Desktop logic
        if (p <= PHASE1_END) {
          // Phase 1: Vertical scroll (frames 0 to VERT_END)
          // We scroll through Hero -> About (only 1 panel translation)
          const scrollProgress = Math.min(1, p / (PHASE1_END * 0.85)); // Finish scrolling text a bit before Phase 1 ends for "dwell"
          
          targetFrameRef.current = (p / PHASE1_END) * FRAME_VERT_END;

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            // Translate through 2 panels (0 to -100vh)
            const maxTranslate = window.innerHeight * 1; 
            leftScroll.style.transform = `translate3d(0, -${scrollProgress * maxTranslate}px, 0)`;
            leftScroll.style.opacity = "1";
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) hz.style.transform = `translate3d(0, 0, 0)`;
        } 
        else if (p <= INTERACTION_END) {
          // Phase 2: Smooth Sine-wave Interaction (Slide In & Out)
          const iP = (p - PHASE1_END) / (INTERACTION_END - PHASE1_END);
          
          const slideP = Math.sin(iP * Math.PI);
          targetFrameRef.current = FRAME_VERT_END + iP * (TOTAL_FRAMES - 1 - FRAME_VERT_END);

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            // Transition from About (-100vh) to Expertise (-200vh) progressively during the stack bounce
            const translateY = window.innerHeight * (1 + iP);
            leftScroll.style.transform = `translate3d(0, -${translateY}px, 0)`;
            leftScroll.style.opacity = "1"; 
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.opacity = "1";
            hz.style.transform = `translate3d(-${slideP * 65}vw, 0, 0)`;
          }

          const canvasWrapper = document.querySelector(".cinematic-canvas-wrapper") as HTMLElement;
          if (canvasWrapper) {
            const scale = 1 + (slideP * 0.05);
            canvasWrapper.style.transform = `scale(${scale})`;
          }

          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "0";
            further.style.pointerEvents = "none";
          }
        }
        else {
          // Phase 3: Final exit
          const phase4P = (p - INTERACTION_END) / (1 - INTERACTION_END);
          targetFrameRef.current = TOTAL_FRAMES - 1;
          
          const further = document.getElementById("further-content");
          if (further) {
            further.style.opacity = "1";
            further.style.pointerEvents = "auto";
            further.style.transform = `translateY(${100 - (phase4P * 100)}vh)`;
          }

          const leftScroll = document.getElementById("cinematic-left-scroll");
          if (leftScroll) {
            leftScroll.style.transform = `translate3d(0, -${window.innerHeight * 2}px, 0)`;
            leftScroll.style.opacity = String(1 - phase4P); 
          }

          const hz = document.getElementById("cinematic-horizontal");
          if (hz) {
            hz.style.transform = `translate3d(0, 0, 0)`;
          }
          
          const heroMain = document.querySelector(".cinematic-hero-main") as HTMLElement;
          if (heroMain) {
            heroMain.style.opacity = String(1 - phase4P);
          }
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
      {/* Car background container moved to root for perfect sticking */}
      <div className="cinematic-right">
        <div className="cinematic-canvas-wrapper">
          <canvas ref={canvasRef} className="cinematic-canvas" />
          
          {/* Real Noise.tsx overlay for consistent texture */}
          <Noise patternAlpha={45} patternRefreshInterval={4} />
          
          {/* White soft mask overlay */}
          <div className="cinematic-white-mask" />

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

              {/* Expertise Panel */}
              <div id="expertise" className="cinematic-panel cinematic-expertise-panel">
                <div className="cinematic-about-badge">
                  <span className="text-accent">✦</span>
                  <span className="cinematic-about-label">Expertise</span>
                </div>
                
                <div className="cinematic-expertise-grid">
                  <div className="expertise-item">
                    <h4 className="expertise-title">Full-Stack Architecture</h4>
                    <p className="expertise-desc">
                      Building high-performance, scalable web systems from core backend logic to fluid, pixel-perfect frontend experiences.
                    </p>
                  </div>
                  <div className="expertise-item">
                    <h4 className="expertise-title">AI & Agentic Workflows</h4>
                    <p className="expertise-desc">
                      Pioneering next-gen automation by integrating intelligent agents and Large Language Models into secure, enterprise-ready solutions.
                    </p>
                  </div>
                  
                  {/* Web3 Dashboard Tile */}
                  <div className="expertise-item expertise-item--web3">
                    <div className="web3-dashboard">
                      <div className="web3-header">
                        <div className="web3-token">
                          <span className="web3-token-pair">BTC / USD</span>
                          <span className="web3-token-price">$64,430.00</span>
                          <span className="web3-token-change text-accent">+1.02%</span>
                        </div>
                        <div className="web3-chart-type">Line chart</div>
                      </div>
                      
                      <div className="web3-chart-container">
                        <svg viewBox="0 0 400 150" className="web3-svg-chart">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <motion.path
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            d="M0,100 C50,80 80,120 120,90 C160,60 190,110 240,70 C290,30 340,80 400,50 L400,150 L0,150 Z"
                            fill="url(#chartGradient)"
                          />
                          <motion.path
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            d="M0,100 C50,80 80,120 120,90 C160,60 190,110 240,70 C290,30 340,80 400,50"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="3"
                          />
                          <circle cx="240" cy="70" r="4" fill="var(--accent)" />
                          <circle cx="240" cy="70" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5">
                            <animate attributeName="r" from="4" to="12" dur="1.5s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                          </circle>
                        </svg>
                      </div>

                      <div className="web3-footer">
                        <div className="web3-stat">
                          <span className="web3-stat-label">Total Balance</span>
                          <span className="web3-stat-value">$78,820.00</span>
                        </div>
                        <div className="web3-stat">
                          <span className="web3-stat-label">Transactions</span>
                          <span className="web3-stat-value text-accent">+5.00 ETH</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="expertise-title">Web3 & Decentralized Systems</h4>
                      <p className="expertise-desc">Developing robust blockchain solutions and secure decentralized protocols for the next digital economy.</p>
                    </div>
                  </div>
                </div>
              </div>



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
