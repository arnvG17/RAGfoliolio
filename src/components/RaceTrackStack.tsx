import React from 'react';
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
import './RaceTrackStack.css';

/* ────────────────────────────────────────────────────────
   Race-Track Stack — Suzuka Circuit replica
   Black & White, Minimalistic, Bold lines
   ──────────────────────────────────────────────────────── */

interface TechItem {
  id: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const techStack: TechItem[] = [
  { id: 't1',  label: 'React',      category: 'FRONTEND',   icon: SiReact,      color: '#61DAFB' },
  { id: 't2',  label: 'TypeScript', category: 'LANGUAGE',   icon: SiTypescript, color: '#3178C6' },
  { id: 't3',  label: 'Node.js',    category: 'RUNTIME',    icon: SiNodedotjs,  color: '#339933' },
  { id: 't4',  label: 'Express',    category: 'BACKEND',    icon: SiExpress,    color: '#ffffff' },
  { id: 't5',  label: 'MongoDB',    category: 'DATABASE',   icon: SiMongodb,    color: '#47A248' },
  { id: 't6',  label: 'Firebase',   category: 'BAAS',       icon: SiFirebase,   color: '#FFCA28' },
  { id: 't7',  label: 'Python',     category: 'LANGUAGE',   icon: SiPython,     color: '#3776AB' },
  { id: 't8',  label: 'LangChain',  category: 'AI / ML',    icon: FaRobot,      color: '#121212' },
  { id: 't9',  label: 'C++ & Java', category: 'SYSTEMS',    icon: SiCplusplus,  color: '#00599C' },
  { id: 't10', label: 'n8n',        category: 'AUTOMATION',  icon: FaProjectDiagram, color: '#FF6D5B' },
  { id: 't11', label: 'Web3 & AI',  category: 'FRONTIER',   icon: FaRobot,      color: '#627EEA' },
];


/*
  Grandstand positions around the Suzuka replica.
  x,y = dot on track.  lx,ly = label position.
  side = which direction the label extends.
*/
interface GrandstandPos {
  x: number; y: number;
  lx: number; ly: number;
  side: 'left' | 'right';
}

const grandstands: GrandstandPos[] = [
  // 0  React — main straight
  { x: 920, y: 470,  lx: 990, ly: 460,  side: 'left' },
  // 1  TypeScript — Turn 1/2 (first right-hander)
  { x: 1010, y: 375, lx: 1070, ly: 365, side: 'left' },
  // 2  Node.js — S-curves top
  { x: 720, y: 100,  lx: 720, ly: 42,   side: 'left' },
  // 3  Express — S-curves mid
  { x: 560, y: 128,  lx: 560, ly: 50,   side: 'left' },
  // 4  MongoDB — Dunlop curve
  { x: 405, y: 210,  lx: 320, ly: 160,  side: 'right' },
  // 5  Firebase — Degner curves
  { x: 510, y: 355,  lx: 420, ly: 340,  side: 'right' },
  // 6  Python — Hairpin
  { x: 440, y: 475,  lx: 345, ly: 490,  side: 'right' },
  // 7  LangChain — Spoon curve
  { x: 240, y: 430,  lx: 120, ly: 445,  side: 'right' },
  // 8  C++ & Java — 130R
  { x: 210, y: 310,  lx: 80,  ly: 310,  side: 'right' },
  // 9  n8n — back straight / overpass
  { x: 460, y: 260,  lx: 345, ly: 270,  side: 'right' },
  // 10 Web3 & AI — Casio Triangle
  { x: 760, y: 525,  lx: 760, ly: 590,  side: 'left' },
];

const RaceTrackStack: React.FC = () => {
  /*
    Suzuka Circuit SVG path — traced to match the iconic figure-8 shape.
    The path follows: Start/Finish → T1/T2 → S-curves → Dunlop →
    Degner → Hairpin → Spoon → 130R → Casio Triangle → back to S/F.
    
    The crossover (overpass/underpass) is near coordinates ~(460, 260).
  */

  // Outer edge of the track
  const outerPath = `
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

  // Inner edge of the track
  const innerPath = `
    M 850,460
    C 910,460 955,445 995,405
    C 1030,370 1025,320 990,285
    C 955,250 895,210 840,175
    C 785,140 730,115 680,112
    C 635,110 585,122 548,140
    C 512,158 478,175 458,198
    C 438,225 438,250 458,270
    C 485,295 520,325 538,350
    C 555,375 548,405 525,430
    C 500,455 470,460 440,455
    C 400,445 355,418 318,388
    C 280,355 255,320 250,280
    C 245,240 260,210 292,192
    C 335,165 395,172 452,198
    C 510,225 548,252 585,278
    C 622,302 660,320 700,320
    C 738,320 778,312 810,338
    C 842,362 858,395 852,430
    C 848,448 842,460 850,460
    Z
  `;

  return (
    <div className="rt-container">
      {/* Section Header */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="text-accent">✦</span>
        <span className="text-accent font-semibold text-sm tracking-[0.3em] uppercase">
          My Stack
        </span>
      </div>


      <svg
        className="rt-svg"
        viewBox="-50 -50 1300 750"
        preserveAspectRatio="xMidYMid meet"
      >

        {/* ═══ Track ═══ */}

        {/* Outer track fill — the "asphalt" between outer and inner */}
        <path d={outerPath} fill="#FFD700" stroke="none" opacity="0.06" />

        {/* Outer bold border */}
        <path
          d={outerPath}
          fill="none"
          stroke="#FFD700"
          strokeWidth="4"
          opacity="1"
          strokeLinejoin="round"
        />

        {/* Inner bold border */}
        <path
          d={innerPath}
          fill="none"
          stroke="#FFD700"
          strokeWidth="2"
          opacity="0.8"
          strokeLinejoin="round"
        />

        {/* Center racing line — thin dashed */}
        <path
          d={outerPath}
          fill="none"
          stroke="#00FF00"
          strokeWidth="1"
          strokeDasharray="8 10"
          opacity="0.4"
          className="rt-center-line"
        />

        {/* ═══ Crossover / Overpass indicator ═══ */}
        {/* Bridge rectangle to show the overpass */}
        <g opacity="0.6">
          <line x1="430" y1="250" x2="490" y2="270" stroke="#00FF00" strokeWidth="16" />
          <line x1="430" y1="250" x2="490" y2="270" stroke="#ffffff" strokeWidth="3" />
          <text x="465" y="240" textAnchor="middle" fill="#ffffff" fontSize="8"
            fontWeight="700" letterSpacing="1" opacity="0.5" fontFamily="monospace">
            OVERPASS
          </text>
        </g>

        {/* ═══ Start / Finish line ═══ */}
        <g>
          {/* Checkerboard stripe */}
          <rect x="848" y="465" width="4" height="25" fill="#00FF00" opacity="0.8" />
          <rect x="852" y="465" width="4" height="25" fill="#ffffff" opacity="0.4" />
          <rect x="856" y="465" width="4" height="25" fill="#00FF00" opacity="0.8" />
          {/* Flag icon ✓ */}
          <text x="870" y="500" textAnchor="start" fill="#ffffff" fontSize="8"
            fontWeight="700" letterSpacing="1.5" opacity="0.5" fontFamily="monospace">
            🏁
          </text>
        </g>

        {/* ═══ Infield watermark ═══ */}
        <text x="600" y="310" textAnchor="middle" fill="#00FF00" fontSize="60"
          fontWeight="900" letterSpacing="16" opacity="0.03"
          fontFamily="'Clash Display', system-ui, sans-serif">
          ARNAV
        </text>

        {/* ═══ Grandstand Labels ═══ */}
        {techStack.map((tech, i) => {
          const g = grandstands[i];
          const isLeft = g.side === 'left';

          return (
            <g key={tech.id} className="rt-grandstand">
              {/* Connector line */}
              <line
                x1={g.x} y1={g.y}
                x2={g.lx} y2={g.ly}
                stroke="#00FF00"
                strokeWidth="1"
                opacity="0.4"
              />

              {/* Track-point marker */}
              <circle cx={g.x} cy={g.y} r="5" fill="#00FF00" opacity="0.9" />
              <circle cx={g.x} cy={g.y} r="8" fill="none"
                stroke="#ffffff" strokeWidth="1" opacity="0.3" />

              {/* Label */}
              <foreignObject
                x={isLeft ? g.lx - 5 : g.lx - 165}
                y={g.ly - 25}
                width="170"
                height="60"
                className="rt-label-fo"
              >
                <div 
                  className={`rt-label ${isLeft ? 'rt-label--left' : 'rt-label--right'}`}
                  style={{ '--brand-color': tech.color } as React.CSSProperties}
                >
                  <div className="rt-label-icon">
                    <tech.icon size={20} color={tech.color} />
                  </div>
                  <div className="rt-label-text">
                    <span className="rt-label-cat">{tech.category}</span>
                    <span className="rt-label-name">{tech.label}</span>
                  </div>
                </div>
              </foreignObject>

            </g>
          );
        })}
      </svg>

      {/* Stats */}
      <div className="rt-stats">
        <div className="rt-stat">
          <span className="rt-stat-num">11</span>
          <span className="rt-stat-lbl">TECH</span>
        </div>
        <span className="rt-stat-sep">·</span>
        <div className="rt-stat">
          <span className="rt-stat-num">5+</span>
          <span className="rt-stat-lbl">DOMAINS</span>
        </div>
        <span className="rt-stat-sep">·</span>
        <div className="rt-stat">
          <span className="rt-stat-num">∞</span>
          <span className="rt-stat-lbl">LAPS</span>
        </div>
      </div>
    </div>
  );
};

export default RaceTrackStack;
