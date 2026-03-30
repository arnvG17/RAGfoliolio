import { useEffect, useRef, useCallback, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollSequence.css";

gsap.registerPlugin(ScrollTrigger);

// ─── Configuration ───
const START_FRAME_OFFSET = 0;
const FRAME_COUNT = 160;
const FRAME_PATH = "/new-sequence/ezgif-frame-";
const FRAME_EXT = ".jpg";

// Preloading config
const CRITICAL_BATCH_SIZE = 20;   // Phase 1: load first N frames immediately
const BACKGROUND_BATCH_SIZE = 8;  // Phase 2: load N frames per idle cycle
const BACKGROUND_DELAY_MS = 30;   // Delay between background batches

const getFrameSrc = (index: number): string => {
  const actualIndex = index + START_FRAME_OFFSET;
  const paddedIndex = String(actualIndex).padStart(3, "0");
  return `${FRAME_PATH}${paddedIndex}${FRAME_EXT}`;
};

// ─── Multi-phase preloader ───
interface PreloadState {
  images: HTMLImageElement[];
  loadedFlags: boolean[];
  loadedCount: number;
  criticalReady: boolean;
  allReady: boolean;
}

function createPreloader(
  onProgress: (loaded: number, total: number, criticalDone: boolean) => void,
  onCriticalReady: () => void,
  onAllReady: () => void,
): PreloadState & { start: () => void; cleanup: () => void } {
  const state: PreloadState = {
    images: new Array(FRAME_COUNT),
    loadedFlags: new Array(FRAME_COUNT).fill(false),
    loadedCount: 0,
    criticalReady: false,
    allReady: false,
  };

  let aborted = false;
  const timeoutIds: ReturnType<typeof setTimeout>[] = [];

  // Load a single image → returns promise
  const loadImage = (index: number): Promise<void> => {
    return new Promise((resolve) => {
      if (state.loadedFlags[index]) {
        resolve();
        return;
      }
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        state.loadedFlags[index] = true;
        state.loadedCount++;
        onProgress(state.loadedCount, FRAME_COUNT, state.criticalReady);
        resolve();
      };
      img.onerror = () => {
        // Retry once on error
        const retry = new Image();
        retry.onload = () => {
          state.images[index] = retry;
          state.loadedFlags[index] = true;
          state.loadedCount++;
          onProgress(state.loadedCount, FRAME_COUNT, state.criticalReady);
          resolve();
        };
        retry.onerror = () => {
          // Mark as loaded anyway to prevent blocking
          state.loadedFlags[index] = true;
          state.loadedCount++;
          resolve();
        };
        retry.src = getFrameSrc(index + 1);
      };
      img.src = getFrameSrc(index + 1); // 1-based filenames
      state.images[index] = img;
    });
  };

  // Phase 2: load remaining frames in small batches with idle delays
  const loadRemainingInBackground = async () => {
    const remaining: number[] = [];
    for (let i = CRITICAL_BATCH_SIZE; i < FRAME_COUNT; i++) {
      if (!state.loadedFlags[i]) remaining.push(i);
    }

    for (let batchStart = 0; batchStart < remaining.length; batchStart += BACKGROUND_BATCH_SIZE) {
      if (aborted) return;

      const batch = remaining.slice(batchStart, batchStart + BACKGROUND_BATCH_SIZE);
      await Promise.all(batch.map(loadImage));

      if (state.loadedCount >= FRAME_COUNT && !state.allReady) {
        state.allReady = true;
        onAllReady();
        return;
      }

      // Yield to main thread between batches
      await new Promise<void>((resolve) => {
        const id = setTimeout(resolve, BACKGROUND_DELAY_MS);
        timeoutIds.push(id);
      });
    }

    if (!state.allReady && state.loadedCount >= FRAME_COUNT) {
      state.allReady = true;
      onAllReady();
    }
  };

  const start = async () => {
    // Phase 1: Critical frames — load first N in parallel
    const criticalIndices = Array.from(
      { length: Math.min(CRITICAL_BATCH_SIZE, FRAME_COUNT) },
      (_, i) => i
    );
    await Promise.all(criticalIndices.map(loadImage));

    if (aborted) return;

    state.criticalReady = true;
    onCriticalReady();

    // Phase 2: Background loading
    loadRemainingInBackground();
  };

  const cleanup = () => {
    aborted = true;
    timeoutIds.forEach(clearTimeout);
  };

  return { ...state, images: state.images, loadedFlags: state.loadedFlags, start, cleanup };
}

// ─── Component ───
const ScrollSequence = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preloaderRef = useRef<ReturnType<typeof createPreloader> | null>(null);
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const lastDrawnFrameRef = useRef<number>(-1);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const dprRef = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  const [loadProgress, setLoadProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "critical" | "ready">("loading");

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  // Draw frame with contain-fit at full DPR resolution for crisp quality
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (lastDrawnFrameRef.current === frameIndex) return;

    const preloader = preloaderRef.current;
    if (!preloader) return;

    // Only render loaded frames
    if (!preloader.loadedFlags[frameIndex]) return;

    const img = preloader.images[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    lastDrawnFrameRef.current = frameIndex;

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Canvas internal size is DPR-scaled, so use full pixel dimensions
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Contain-fit at full resolution
    const scale = Math.min(cw / iw, ch / ih);
    const sw = iw * scale;
    const sh = ih * scale;
    const sx = (cw - sw) / 2;
    const sy = (ch - sh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, sx, sy, sw, sh);
  }, []);

  // Smooth render loop via lerp
  const animationLoop = useCallback(() => {
    const current = currentFrameRef.current;
    const target = targetFrameRef.current;
    const diff = Math.abs(target - current);
    
    // Slower speeds for more "buttery" feel
    const speed = diff > 5 ? 0.08 : 0.04;

    const nextFrame = lerp(current, target, speed);
    currentFrameRef.current = nextFrame;

    const rounded = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(nextFrame)));
    drawFrame(rounded);

    rafIdRef.current = requestAnimationFrame(animationLoop);
  }, [drawFrame]);

  // Size canvas at full devicePixelRatio for crisp HiDPI rendering
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const rect = canvas.getBoundingClientRect();

    // Set internal resolution to DPR × CSS size (e.g. 2x on retina)
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // CSS size stays the same
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Force redraw at new resolution
    lastDrawnFrameRef.current = -1;
    const frame = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrameRef.current)));
    drawFrame(frame);
  }, [drawFrame]);

  // ─── Preloading ───
  useEffect(() => {
    const preloader = createPreloader(
      // onProgress
      (loaded, total) => {
        setLoadProgress(Math.round((loaded / total) * 100));
      },
      // onCriticalReady — enough frames to start animation
      () => {
        setPhase("critical");
      },
      // onAllReady
      () => {
        setPhase("ready");
      },
    );

    preloaderRef.current = preloader;
    preloader.start();

    return () => {
      preloader.cleanup();
    };
  }, []);

  // ─── ScrollTrigger + render loop (starts once critical frames are loaded) ───
  useEffect(() => {
    if (phase === "loading") return;

    resizeCanvas();
    drawFrame(0);

    window.addEventListener("resize", resizeCanvas);
    rafIdRef.current = requestAnimationFrame(animationLoop);

    // GSAP ScrollTrigger with PIN — section stays fixed until animation completes
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "+=1500%", // Significantly increased distance for "very slow" feel
      pin: true,       // PIN the section in place
      scrub: 1.2,      // Added 1.2s scrub for extra smoothness
      anticipatePin: 1,
      onUpdate: (self) => {
        targetFrameRef.current = self.progress * (FRAME_COUNT - 1);

        // Update progress indicator
        const thumb = document.getElementById("seq-progress-thumb");
        if (thumb) {
          thumb.style.height = `${self.progress * 100}%`;
        }
      },
    });

    triggerRef.current = trigger;

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      trigger.kill();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [phase, resizeCanvas, animationLoop, drawFrame]);

  const progressPercent = loadProgress;
  const isLoading = phase === "loading";

  return (
    <section ref={sectionRef} className="scroll-seq-section">
      {/* Canvas display */}
      <div className="scroll-seq-viewport">
        <div className="scroll-seq-canvas-card">
          <canvas ref={canvasRef} className="scroll-seq-canvas" />
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="scroll-seq-loader">
            <div className="scroll-seq-loader-content">
              <div className="scroll-seq-spinner" />
              <div className="scroll-seq-loader-bar">
                <div
                  className="scroll-seq-loader-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="scroll-seq-loader-text">
                {progressPercent < 100
                  ? `Loading experience · ${progressPercent}%`
                  : "Initializing…"}
              </span>
            </div>
          </div>
        )}

        {/* Scroll progress indicator (right edge) */}
        {!isLoading && (
          <div className="scroll-seq-progress">
            <div className="scroll-seq-progress-track">
              <div className="scroll-seq-progress-thumb" id="seq-progress-thumb" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScrollSequence;
