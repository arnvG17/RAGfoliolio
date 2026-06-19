import React, { useEffect, useRef, useState } from 'react';
import {
  SiReact,
  SiNodedotjs,
  SiMongodb,
  SiCplusplus,
  SiPython,
  SiExpress,
  SiFirebase,
  SiTypescript,
} from 'react-icons/si';
import { FaRobot, FaProjectDiagram } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CardSwap, { Card } from './CardSwap';
import './RaceTrackStack.css';

gsap.registerPlugin(ScrollTrigger);

interface TechItem {
  id: string;
  label: string;
  category: string;
  description: string;
  proficiency: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  trackProgress: number;
  latency: string;
}

const techStack: TechItem[] = [
  { 
    id: 't1',  
    label: 'React.js', 
    category: 'FRONTEND', 
    description: 'Developing high-speed modular web interfaces with declarative state management, virtual DOM rendering, and custom hooks.',
    proficiency: 92,
    icon: SiReact, 
    color: '#00d8ff',
    trackProgress: 0.04,
    latency: '8ms'
  },
  { 
    id: 't2',  
    label: 'TypeScript', 
    category: 'LANGUAGE', 
    description: 'Ensuring absolute type safety and static compiler checks across application layers, mitigating runtime exceptions.',
    proficiency: 88,
    icon: SiTypescript, 
    color: '#3178c6',
    trackProgress: 0.12,
    latency: '0.1ms'
  },
  { 
    id: 't3',  
    label: 'Node.js', 
    category: 'RUNTIME', 
    description: 'Executing asynchronous backend logic on Chrome\'s V8 engine, managing low-latency event-driven server tasks.',
    proficiency: 90,
    icon: SiNodedotjs, 
    color: '#539e43',
    trackProgress: 0.21,
    latency: '15ms'
  },
  { 
    id: 't4',  
    label: 'Express', 
    category: 'BACKEND', 
    description: 'Structuring RESTful API routes, middleware controllers, CORS configurations, and token authenticators.',
    proficiency: 90,
    icon: SiExpress, 
    color: '#a0a0a0',
    trackProgress: 0.30,
    latency: '11ms'
  },
  { 
    id: 't5',  
    label: 'MongoDB', 
    category: 'DATABASE', 
    description: 'Managing dynamic document stores with sharded indexes, aggregation utilities, and schema-less data structure models.',
    proficiency: 85,
    icon: SiMongodb, 
    color: '#13aa52',
    trackProgress: 0.40,
    latency: '18ms'
  },
  { 
    id: 't6',  
    label: 'Firebase', 
    category: 'BAAS', 
    description: 'Integrating instant real-time databases, secure user authorization gates, and cloud function triggers.',
    proficiency: 82,
    icon: SiFirebase, 
    color: '#ffca28',
    trackProgress: 0.50,
    latency: '42ms'
  },
  { 
    id: 't7',  
    label: 'Python', 
    category: 'LANGUAGE', 
    description: 'Building web scrapers, computational scripts, data processing models, and AI agent frameworks.',
    proficiency: 85,
    icon: SiPython, 
    color: '#3776ab',
    trackProgress: 0.61,
    latency: '10ms'
  },
  { 
    id: 't8',  
    label: 'LangChain', 
    category: 'AI / ML', 
    description: 'Orchestrating multi-agent reasoning loops, LLM chains, semantic memory databases, and custom RAG retrieval vectors.',
    proficiency: 80,
    icon: FaRobot, 
    color: '#ff007f',
    trackProgress: 0.72,
    latency: '110ms'
  },
  { 
    id: 't9',  
    label: 'C++ & Java', 
    category: 'SYSTEMS', 
    description: 'Writing high-performance algorithmic solutions, custom compilers, and memory-safe system architectures.',
    proficiency: 80,
    icon: SiCplusplus, 
    color: '#00599c',
    trackProgress: 0.81,
    latency: '2ms'
  },
  { 
    id: 't10', 
    label: 'n8n', 
    category: 'AUTOMATION', 
    description: 'Designing node-based visual webhook workflows, integration connectors, and automatic data sync tunnels.',
    proficiency: 85,
    icon: FaProjectDiagram, 
    color: '#ff6d5b',
    trackProgress: 0.90,
    latency: '60ms'
  },
  { 
    id: 't11', 
    label: 'Web3 & AI', 
    category: 'FRONTIER', 
    description: 'Deploying decentralized ledger smart contracts and protocols that interface with agentic reasoning models.',
    proficiency: 78,
    icon: FaRobot, 
    color: '#627eea',
    trackProgress: 0.97,
    latency: '120ms'
  },
];

interface GrandstandPos {
  x: number; y: number;
  lx: number; ly: number;
  side: 'left' | 'right';
}

const grandstands: GrandstandPos[] = [
  { x: 920, y: 470,  lx: 975, ly: 465,  side: 'left' },  // React
  { x: 1010, y: 375, lx: 1065, ly: 370, side: 'left' },  // TypeScript
  { x: 720, y: 100,  lx: 775, ly: 95,   side: 'left' },  // Node.js
  { x: 560, y: 128,  lx: 615, ly: 123,  side: 'left' },  // Express
  { x: 405, y: 210,  lx: 345, ly: 205,  side: 'right' }, // MongoDB
  { x: 510, y: 355,  lx: 450, ly: 350,  side: 'right' }, // Firebase
  { x: 440, y: 475,  lx: 380, ly: 470,  side: 'right' }, // Python
  { x: 240, y: 430,  lx: 180, ly: 425,  side: 'right' }, // LangChain
  { x: 210, y: 310,  lx: 150, ly: 305,  side: 'right' }, // C++ & Java
  { x: 460, y: 260,  lx: 400, ly: 255,  side: 'right' }, // n8n
  { x: 760, y: 525,  lx: 815, ly: 520,  side: 'left' },  // Web3 & AI
];

const RaceTrackStack: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const activeIdxRef = useRef<number>(0);
  activeIdxRef.current = activeIdx;

  const [pathLength, setPathLength] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const trackPath = `
    M 850,490
    C 920,490 980,470 1030,420
    C 1070,380 1060,320 1020,280
    C 980,240 920,200 860,160
    C 800,120 740,85 680,80
    C 620,78 560,95 520,115
    C 480,135 440,155 420,180
    C 395,210 390,250 420,280
    C 450,310 490,340 510,370
    C 530,400 520,435 490,465
    C 460,495 430,500 400,490
    C 360,475 310,445 270,410
    C 230,375 200,330 195,280
    C 190,230 210,190 250,165
    C 300,130 370,140 430,170
    C 490,200 530,230 570,260
    C 610,290 650,310 700,310
    C 750,310 800,300 840,330
    C 880,360 900,400 890,440
    C 880,470 870,490 850,490
    Z
  `;

  const updateCar = (progress: number) => {
    const path = pathRef.current;
    const car = carRef.current;
    if (!path || !car) return;

    const len = path.getTotalLength();
    const point = path.getPointAtLength(progress * len);
    
    const delta = 2; // px
    const nextProgress = Math.min(1, progress + delta / len);
    const nextPoint = path.getPointAtLength(nextProgress * len);
    
    const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

    car.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`);

    // Find closest tech item based on coordinates first
    let nearestIdx = 0;
    let minDist = Infinity;
    grandstands.forEach((g, idx) => {
      const dx = g.x - point.x;
      const dy = g.y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = idx;
      }
    });

    // Switch card only when car is within 65px of the closest milestone.
    // Use progress boundaries for safe start/end transitions.
    const REACH_THRESHOLD = 65; // px in SVG space
    let newActiveIdx = activeIdxRef.current;
    if (minDist < REACH_THRESHOLD) {
      newActiveIdx = nearestIdx;
    } else if (progress < 0.01) {
      newActiveIdx = 0;
    } else if (progress > 0.99) {
      newActiveIdx = techStack.length - 1;
    }

    // Update glowing tail trail points directly in the DOM for peak scroll performance
    const trail = trailRef.current;
    if (trail && trail.children) {
      const activeColor = techStack[newActiveIdx]?.color || '#ffffff';
      for (let i = 1; i <= 5; i++) {
        const trailCircle = trail.children[i - 1];
        if (trailCircle) {
          const trailProgress = Math.max(0, progress - (i * 6) / len);
          const trailPoint = path.getPointAtLength(trailProgress * len);
          trailCircle.setAttribute('cx', String(trailPoint.x));
          trailCircle.setAttribute('cy', String(trailPoint.y));
          trailCircle.setAttribute('fill', activeColor);
        }
      }
    }

    if (newActiveIdx !== activeIdxRef.current) {
      setActiveIdx(newActiveIdx);
    }
  };

  useEffect(() => {
    updateCar(0);

    if (isMobile) {
      const trigger = ScrollTrigger.create({
        trigger: '.cinematic-h-panel-stack',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          updateCar(self.progress);
        }
      });
      return () => {
        trigger.kill();
      };
    } else {
      const handleScroll = (e: Event) => {
        const customEvent = e as CustomEvent<{ progress: number }>;
        const p = customEvent.detail.progress;
        const start = 0.35;
        const end = 0.65;
        
        let carProgress = 0;
        if (p >= start && p <= end) {
          carProgress = (p - start) / (end - start);
        } else if (p > end) {
          carProgress = 1;
        } else {
          carProgress = 0;
        }
        
        updateCar(carProgress);
      };

      window.addEventListener("stack-scroll", handleScroll);
      return () => {
        window.removeEventListener("stack-scroll", handleScroll);
      };
    }
  }, [isMobile]);

  const activeTech = techStack[activeIdx];
  const ActiveIcon = activeTech.icon;

  return (
    <div className="rt-wrapper" ref={containerRef}>
      {/* ─── BACKGROUND GLOW EFFECTS & CYBER GRID ─── */}
      <div className="rt-grid-bg" />
      <div className="rt-glow-orb rt-orb-1" style={{ '--accent-color': activeTech.color } as React.CSSProperties} />
      <div className="rt-glow-orb rt-orb-2" />

      {/* ─── HEADER ─── */}
      <div className="rt-minimal-header">
        <span className="rt-minimal-tag">SYSTEMS DIAGNOSTICS</span>
        <h2 className="rt-minimal-title">My Tech Stack</h2>
      </div>

      {/* ─── VERTICAL STACK LAYOUT ─── */}
      <div className="rt-flex-layout">
        
        {/* Track Column - Spans Full Width */}
        <div className="rt-track-pane">
          <svg
            className="rt-svg-minimal"
            viewBox="50 50 1100 550"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Track boundary fill */}
            <path d={trackPath} fill="rgba(255, 255, 255, 0.01)" stroke="none" />

            {/* F1 Circuit Asphalt Road Layer (Base outline and width) */}
            <path
              d={trackPath}
              fill="none"
              stroke="#0f0f14"
              strokeWidth="20"
              strokeLinejoin="round"
            />
            <path
              d={trackPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="22"
              strokeLinejoin="round"
            />

            {/* F1 Circuit Colored Sectors (Overlayed dynamically) */}
            {pathLength > 0 && (
              <>
                {/* Sector 1 (Red): Finish Line to Turn 5 (0.0 to 0.35) */}
                <path
                  d={trackPath}
                  fill="none"
                  stroke="#e10600"
                  strokeWidth="8"
                  strokeLinejoin="round"
                  strokeDasharray={`${pathLength * 0.35} ${pathLength}`}
                  strokeDashoffset={0}
                  opacity="0.9"
                />
                
                {/* Sector 2 (Blue): Turn 5 to Turn 11 (0.35 to 0.65) */}
                <path
                  d={trackPath}
                  fill="none"
                  stroke="#00b0f0"
                  strokeWidth="8"
                  strokeLinejoin="round"
                  strokeDasharray={`0 ${pathLength * 0.35} ${pathLength * 0.30} ${pathLength}`}
                  strokeDashoffset={0}
                  opacity="0.9"
                />

                {/* Sector 3 (Yellow): Turn 11 to Finish Line (0.65 to 1.0) */}
                <path
                  d={trackPath}
                  fill="none"
                  stroke="#ffd800"
                  strokeWidth="8"
                  strokeLinejoin="round"
                  strokeDasharray={`0 ${pathLength * 0.65} ${pathLength * 0.35} ${pathLength}`}
                  strokeDashoffset={0}
                  opacity="0.9"
                />
              </>
            )}

            {/* Racetrack boundaries (hidden calculations path) */}
            <path
              d={trackPath}
              ref={pathRef}
              fill="none"
              stroke="none"
              strokeWidth="1"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* Center Racing line */}
            <path
              d={trackPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="0.75"
              strokeDasharray="3 5"
              className="rt-centerline-flow"
            />

            {/* Start / Finish checker line */}
            <line x1="846" y1="462" x2="854" y2="488" stroke="#fff" strokeWidth="2.5" opacity="0.4" />

            {/* ─── Grandstands / Tech Dots ─── */}
            {techStack.map((tech, idx) => {
              const g = grandstands[idx];
              const isCurrent = activeIdx === idx;
              const isLeft = g.side === 'left';

              // Math to offset turn marker 16px along connector line to avoid F1 car clipping
              const angle = Math.atan2(g.ly - g.y, g.lx - g.x);
              const circleX = g.x + Math.cos(angle) * 16;
              const circleY = g.y + Math.sin(angle) * 16;

              return (
                <g key={tech.id} className={`rt-turn-marker ${isCurrent ? 'active' : ''}`} style={{ '--accent-color': tech.color } as React.CSSProperties}>
                  {/* Connector line */}
                  <line
                    x1={circleX} y1={circleY}
                    x2={g.lx} y2={g.ly}
                    stroke={isCurrent ? tech.color : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={isCurrent ? 1.5 : 0.75}
                    className="rt-connector"
                  />

                  {/* Corner Turn marker circle */}
                  <circle 
                    cx={circleX} cy={circleY} 
                    r={isCurrent ? 11 : 9.5} 
                    fill="#0a0a0f"
                    stroke={isCurrent ? tech.color : '#444'}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Corner Turn number */}
                  <text
                    x={circleX}
                    y={circleY + 3.5}
                    textAnchor="middle"
                    fill={isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'}
                    fontSize={isCurrent ? 8.5 : 7.5}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </text>

                  {/* Clean text label */}
                  <text
                    x={isLeft ? g.lx : g.lx}
                    y={g.ly + 4}
                    textAnchor={isLeft ? 'start' : 'end'}
                    fill={isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'}
                    fontSize="14"
                    fontWeight={isCurrent ? '700' : '400'}
                    fontFamily="monospace"
                    className="rt-text-label"
                    style={{ transition: 'fill 0.3s ease' }}
                  >
                    {tech.label}
                  </text>
                </g>
              );
            })}

            {/* ─── Speed Trap visual overlay ─── */}
            {/* Speed trap */}
            <g className="rt-drs-box" transform="translate(265, 480)" style={{ cursor: 'pointer' }}>
              <line x1="-15" y1="0" x2="-25" y2="-50" stroke="#ff007f" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.5" />
              <rect x="-45" y="-11" width="90" height="22" rx="4" fill="#ff007f" stroke="#fff" strokeWidth="1.5" opacity="0.85" />
              <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                SPEED TRAP
              </text>
            </g>

            {/* ─── Moving Car Trail (DOM manipulated) ─── */}
            <g ref={trailRef} style={{ pointerEvents: 'none' }}>
              <circle r="7" opacity="0.5" filter="url(#node-glow)" />
              <circle r="5.5" opacity="0.38" />
              <circle r="4.2" opacity="0.25" />
              <circle r="3" opacity="0.14" />
              <circle r="1.8" opacity="0.06" />
            </g>

            {/* ─── Moving Car ─── */}
            <g ref={carRef} style={{ pointerEvents: 'none' }}>
              {/* Outer soft glow ring */}
              <circle cx="0" cy="0" r="16" fill={activeTech.color} opacity="0.25" filter="url(#node-glow)" style={{ transition: 'fill 0.3s ease' }} />
              {/* F1 Car silhouette centered at 0,0, facing right */}
              <rect x="-11" y="-8" width="6" height="3" fill="#050505" rx="0.5" />
              <rect x="-11" y="5" width="6" height="3" fill="#050505" rx="0.5" />
              <rect x="5" y="-9" width="7" height="3.5" fill="#050505" rx="0.5" />
              <rect x="5" y="5.5" width="7" height="3.5" fill="#050505" rx="0.5" />
              {/* Wings */}
              <rect x="-15" y="-6" width="2" height="12" fill="#555" rx="0.5" />
              <line x1="-15" y1="0" x2="-11" y2="0" stroke="#555" strokeWidth="1.5" />
              {/* Body Chassis */}
              <path d="M -11,-5 L 7,-3 L 11,0 L 7,3 L -11,5 Z" fill={activeTech.color} style={{ transition: 'fill 0.3s ease' }} />
              {/* Cockpit */}
              <circle cx="-1" cy="0" r="2.5" fill="#000" />
              <path d="M 13,-6 L 15,-6 L 15,6 L 13,6 Z" fill="#555" />
              <line x1="8" y1="0" x2="14" y2="0" stroke="#555" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Telemetry Dashboard Card - Spans Full Width */}
        <div className="rt-details-pane">
          <CardSwap
            width={isMobile ? 150 : 180}
            height={isMobile ? 150 : 180}
            cardDistance={isMobile ? 4 : -6}
            verticalDistance={isMobile ? 4 : 8}
            activeIndex={activeIdx}
            skewAmount={isMobile ? 2 : 2}
          >
            {techStack.map((tech, idx) => {
              const ActiveIcon = tech.icon;
              const isCurrent = activeIdx === idx;
              return (
                <Card
                  key={tech.id}
                  className={`rt-square-card ${isCurrent ? 'active' : ''}`}
                >
                  {/* iOS-style Top Window Header with 3 Dots */}
                  <div className="rt-ios-header">
                    <div className="rt-ios-dot" />
                    <div className="rt-ios-dot" />
                    <div className="rt-ios-dot" />
                  </div>
                  
                  <div className="rt-square-layout">
                    <div className="rt-square-icon-box">
                      <ActiveIcon size={36} color={isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'} />
                    </div>
                    <h3 className="rt-square-tech-name">{tech.label}</h3>
                  </div>
                </Card>
              );
            })}
          </CardSwap>
        </div>

      </div>
    </div>
  );
};

export default RaceTrackStack;
