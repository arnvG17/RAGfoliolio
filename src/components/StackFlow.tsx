import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
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
import { 
  FaCode,
  FaRobot,
  FaProjectDiagram
} from 'react-icons/fa';
import 'reactflow/dist/style.css';

/*
  StackFlow — Brutalist Theme
  - Dark background: #1e1e1e
  - Neo-brutalist nodes with bold borders and shadows
  - Real ReactFlow handles (left input, right output)
  - Random node positions
  - Drag from a handle to create new connections (n8n-style)
  - Edges animated (moving feel) using strokeDasharray + animated flag
*/

const CYAN = '#00FFFF';
const MAGENTA = '#FF00FF';
const YELLOW = '#FFFF00';
const ORANGE = '#FF8C00';
const LIME = '#00FF00';
const DARK_BG = '#1e1e1e';

// Vibrant brutalist color palette for categories
const brutalistColors = {
  'Frontend': '#FF6B6B',
  'Backend': '#4ECDC4',
  'Database': '#FFE66D',
  'AI/ML': '#A8E6CF',
  'AI Routing': '#FF8B94',
  'Systems': '#95E1D3',
  'Data Science': '#F38181',
  'Auth/DB': '#AA96DA',
  'Bundler': '#FCBAD3',
  'Language': '#FFD93D',
  'Automation': '#FF6B9D',
};

// Individual icon colors for each node
const iconColors = {
  'React.js': '#61DAFB',
  'Node.js': '#339933',
  'MongoDB': '#47A248',
  'C++ & Java': '#00599C',
  'LangChain': '#F7DF1E',
  'Python': '#3776AB',
  'Express': '#000000',
  'Firebase': '#FFCA28',
  'TypeScript': '#3178C6',
  'n8n': '#FF6B6B',
};

// Icon component mapping
const iconComponents = {
  'React.js': SiReact,
  'Node.js': SiNodedotjs,
  'MongoDB': SiMongodb,
  'C++ & Java': SiCplusplus,
  'LangChain': FaRobot,
  'Python': SiPython,
  'Express': SiExpress,
  'Firebase': SiFirebase,
  'TypeScript': SiTypescript,
  'n8n': FaProjectDiagram,
};

// Orange pulsating edge style with forward animation
const edgeStyle = {
  stroke: '#D97706', // Dull orange
  strokeWidth: 3,
  strokeDasharray: '10 8',
};

// Better randomized positioning - 2 columns with smart variation
const getGridPosition = (index) => {
  const cols = 2;
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // Base spacing for 2 columns (increased for bigger nodes)
  const baseSpacingX = 550;
  const baseSpacingY = 280;
  const startX = 100;
  const startY = 50;
  
  // Better randomized offsets - more variation but still structured
  // Using a pseudo-random function based on index for consistency
  const seed = index * 137.508; // Golden angle approximation
  const randomX = Math.sin(seed) * 100; // ±100px horizontal variation
  const randomY = Math.cos(seed * 1.3) * 80; // ±80px vertical variation
  
  // Add some row-based variation for better distribution
  const rowVariation = (row % 2 === 0 ? 1 : -1) * 30;
  
  return {
    x: startX + col * baseSpacingX + randomX + rowVariation,
    y: startY + row * baseSpacingY + randomY,
  };
};

// --- Better randomized nodes (2 columns with smart variation) ---
const initialNodes = [
  { id: '1', type: 'stackNode', position: getGridPosition(0), data: { idShort: '1', label: 'React.js', category: 'Frontend', description: 'Dynamic UI powerhouse', isActive: true } },
  { id: '2', type: 'stackNode', position: getGridPosition(1), data: { idShort: '2', label: 'Node.js', category: 'Backend', description: 'Server-side runtime', isActive: false } },
  { id: '3', type: 'stackNode', position: getGridPosition(2), data: { idShort: '3', label: 'MongoDB', category: 'Database', description: 'NoSQL flexibility', isActive: false } },
  { id: '4', type: 'stackNode', position: getGridPosition(3), data: { idShort: '4', label: 'C++ & Java', category: 'Systems', description: 'Performance critical', isActive: false } },
  { id: '5', type: 'stackNode', position: getGridPosition(4), data: { idShort: '5', label: 'LangChain', category: 'AI/ML', description: 'LLM orchestration', isActive: false } },
  { id: '6', type: 'stackNode', position: getGridPosition(5), data: { idShort: '6', label: 'Python', category: 'Data Science', description: 'Versatile scripting', isActive: false } },
  { id: '7', type: 'stackNode', position: getGridPosition(6), data: { idShort: '7', label: 'Express', category: 'Backend', description: 'Web server framework', isActive: false } },
  { id: '8', type: 'stackNode', position: getGridPosition(7), data: { idShort: '8', label: 'Firebase', category: 'Auth/DB', description: 'Realtime & Auth', isActive: false } },
  { id: '9', type: 'stackNode', position: getGridPosition(8), data: { idShort: '9', label: 'n8n', category: 'Automation', description: 'Workflow automation', isActive: false } },
  { id: '10', type: 'stackNode', position: getGridPosition(9), data: { idShort: '10', label: 'TypeScript', category: 'Language', description: 'Typed JS', isActive: false } },
];

// --- Reduced edges showing key connections ---
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' } },
  { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' } },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' } },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' } },
  { id: 'e1-10', source: '1', target: '10', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' } },
];

// Helper function to check if color is dark
const isDarkColor = (color) => {
  if (color === '#000000' || color === '#000') return true;
  // Convert hex to RGB and calculate brightness
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128; // Dark if brightness is less than 128
};

// --- Custom node renderer (brutalist style) ---
const StackNode = ({ data, isConnectable }) => {
  const categoryColor = brutalistColors[data.category] || CYAN;
  const iconColor = iconColors[data.label] || categoryColor;
  const nodeBg = iconColor; // Use icon color for entire node background
  const textColor = isDarkColor(nodeBg) ? '#fff' : '#000';
  const IconComponent = iconComponents[data.label] || FaCode;
  
  return (
    <div style={{ width: 320 }} className="relative px-6 py-5 rounded-md border-4 border-black shadow-[6px_6px_0_#000] select-none" >
      {/* left input handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 20,
          height: 20,
          background: '#fff',
          border: '3px solid #000',
          borderRadius: '50%',
          left: -16,
        }}
      />

      {/* right output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 20,
          height: 20,
          background: '#fff',
          border: '3px solid #000',
          borderRadius: '50%',
          right: -16,
        }}
      />

      <div style={{ background: nodeBg, padding: 16, border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          background: '#fff', 
          border: '4px solid #000', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          boxShadow: '4px 4px 0 #000',
          flexShrink: 0,
        }}>
          <IconComponent size={32} color="#000" />
        </div>
        <div style={{ fontWeight: 900, fontSize: 24, color: textColor, letterSpacing: '-0.5px' }}>
          {data.label}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = { stackNode: StackNode };

// --- Main component ---
export default function StackFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Allow creating edges by dragging from handle -> handle (n8n style)
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: edgeStyle,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' },
          },
          eds
        )
      ),
    [setEdges]
  );

  // click node to active-highlight it
  const onNodeClick = useCallback((e, node) => {
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, isActive: n.id === node.id } })));
  }, [setNodes]);

  return (
    <div style={{ width: '100%', height: 720, background: DARK_BG, padding: 24 }}>
      <style>{`
        @keyframes dashForward {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 18;
            opacity: 0.7;
          }
        }
        .react-flow__edge-path {
          animation: dashForward 1.5s linear infinite;
        }
      `}</style>
      <div style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', border: '6px solid #000', boxShadow: '12px 12px 0 #000' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          connectionLineStyle={{ stroke: '#D97706', strokeWidth: 3, strokeDasharray: '10 8' }}
        >
          <Controls
            style={{ 
              background: '#fff', 
              border: '3px solid #000', 
              borderRadius: 6, 
              boxShadow: '6px 6px 0 #000',
            }}
          />
          <Background gap={18} size={2} color="#222" />
        </ReactFlow>
      </div>
    </div>
  );
}
