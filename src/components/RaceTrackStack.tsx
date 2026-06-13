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
  
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Proximity search: find closest tech item based on coordinates
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

    setActiveIdx(nearestIdx);
  };

  useEffect(() => {
    updateCar(0);

    const isMobile = window.innerWidth <= 900;
    let trigger: ScrollTrigger;

    if (isMobile) {
      trigger = ScrollTrigger.create({
        trigger: '.cinematic-h-panel-stack',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          updateCar(self.progress);
        }
      });
    } else {
      trigger = ScrollTrigger.create({
        trigger: '.cinematic-section',
        start: 'top top',
        end: '+=800%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const start = 0.35;
          const end = 0.55;
          
          let carProgress = 0;
          if (p >= start && p <= end) {
            carProgress = (p - start) / (end - start);
          } else if (p > end) {
            carProgress = 1;
          } else {
            carProgress = 0;
          }
          
          updateCar(carProgress);
        }
      });
    }

    return () => {
      if (trigger) trigger.kill();
    };
  }, []);

  const activeTech = techStack[activeIdx];
  const ActiveIcon = activeTech.icon;

  return (
    <div className="rt-wrapper" ref={containerRef}>
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

            {/* Racetrack boundaries */}
            <path
              d={trackPath}
              ref={pathRef}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d={trackPath}
              fill="none"
              stroke="#0a0a0c"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            
            {/* Center Racing line */}
            <path
              d={trackPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="0.75"
              strokeDasharray="4 6"
              className="rt-centerline-flow"
            />

            {/* Start / Finish checker line */}
            <line x1="846" y1="462" x2="854" y2="488" stroke="#fff" strokeWidth="2.5" opacity="0.3" />

            {/* ─── Grandstands / Tech Dots ─── */}
            {techStack.map((tech, idx) => {
              const g = grandstands[idx];
              const isCurrent = activeIdx === idx;
              const isLeft = g.side === 'left';

              return (
                <g key={tech.id} className={`rt-tag-node ${isCurrent ? 'active' : ''}`}>
                  {/* Connector line */}
                  <line
                    x1={g.x} y1={g.y}
                    x2={g.lx} y2={g.ly}
                    stroke={isCurrent ? tech.color : 'rgba(255, 255, 255, 0.1)'}
                    strokeWidth={isCurrent ? 1.5 : 0.75}
                    className="rt-connector"
                  />

                  {/* Node point on track */}
                  <circle 
                    cx={g.x} cy={g.y} 
                    r={isCurrent ? 6 : 4} 
                    fill={isCurrent ? tech.color : '#1f1f23'}
                    stroke={isCurrent ? '#fff' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={isCurrent ? 1.5 : 1}
                    filter={isCurrent ? 'url(#node-glow)' : 'none'}
                    style={{ transition: 'all 0.3s ease' }}
                  />

                  {/* Clean text label */}
                  <text
                    x={isLeft ? g.lx : g.lx}
                    y={g.ly + 4}
                    textAnchor={isLeft ? 'start' : 'end'}
                    fill={isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.35)'}
                    fontSize="11"
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

            {/* ─── Moving Car ─── */}
            <g ref={carRef} style={{ pointerEvents: 'none' }}>
              {/* Outer soft glow ring */}
              <circle cx="0" cy="0" r="16" fill={activeTech.color} opacity="0.3" filter="url(#node-glow)" />
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
          <div className="rt-card" style={{ '--accent-color': activeTech.color } as React.CSSProperties}>
            <div className="rt-card-border-glow"></div>
            
            <div className="rt-telemetry-layout">
              
              {/* Left Column: Tech Identity */}
              <div className="rt-telemetry-left">
                <div className="rt-icon-box" style={{ borderColor: activeTech.color, boxShadow: `0 0 10px ${activeTech.color}22` }}>
                  <ActiveIcon size={22} color={activeTech.color} />
                </div>
                <div className="rt-title-box">
                  <span className="rt-cat-tag">SECTOR: {activeTech.category}</span>
                  <h3 className="rt-tech-name">{activeTech.label}</h3>
                </div>
              </div>

              {/* Right Column: Telemetry Stats & Desc */}
              <div className="rt-telemetry-right">
                <p className="rt-tech-desc">
                  {activeTech.description}
                </p>
                
                <div className="rt-meter-area">
                  <div className="rt-meter-info">
                    <span className="rt-meter-label">ENGINE SPEED (PROFICIENCY)</span>
                    <span className="rt-meter-val" style={{ color: activeTech.color }}>{activeTech.proficiency}%</span>
                  </div>
                  <div className="rt-bar-bg">
                    <div 
                      className="rt-bar-fill" 
                      style={{ 
                        width: `${activeTech.proficiency}%`, 
                        backgroundColor: activeTech.color,
                        boxShadow: `0 0 8px ${activeTech.color}44`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="rt-card-footer">
                  <div className="flex gap-4">
                    <span>LATENCY: {activeTech.latency}</span>
                    <span>STATUS: OPTIMAL</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="rt-stat-pill">DIAGNOSTICS: NOMINAL</span>
                    <span className="rt-stat-lap">LAP TIME: 1:32.482</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RaceTrackStack;
