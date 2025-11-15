import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
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

// Vibrant brutalist color palette
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
};

// Brutalist edge style
const edgeStyle = {
  stroke: '#000',
  strokeWidth: 3,
  strokeDasharray: '8 6',
};

// Generate random positions
const getRandomPosition = () => ({
  x: Math.floor(Math.random() * 1000) + 50,
  y: Math.floor(Math.random() * 500) + 50,
});

// --- Randomly positioned nodes ---
const initialNodes = [
  { id: '1', type: 'stackNode', position: getRandomPosition(), data: { idShort: '1', label: 'React.js', category: 'Frontend', icon: '⚛️', description: 'Dynamic UI powerhouse', isActive: true } },
  { id: '2', type: 'stackNode', position: getRandomPosition(), data: { idShort: '2', label: 'Node.js', category: 'Backend', icon: '🟢', description: 'Server-side runtime', isActive: false } },
  { id: '3', type: 'stackNode', position: getRandomPosition(), data: { idShort: '3', label: 'MongoDB', category: 'Database', icon: '🍃', description: 'NoSQL flexibility', isActive: false } },
  { id: '4', type: 'stackNode', position: getRandomPosition(), data: { idShort: '4', label: 'C++ & Java', category: 'Systems', icon: '⚙️', description: 'Performance critical', isActive: false } },
  { id: '5', type: 'stackNode', position: getRandomPosition(), data: { idShort: '5', label: 'LangChain', category: 'AI/ML', icon: '🤖', description: 'LLM orchestration', isActive: false } },
  { id: '6', type: 'stackNode', position: getRandomPosition(), data: { idShort: '6', label: 'Python', category: 'Data Science', icon: '🐍', description: 'Versatile scripting', isActive: false } },
  { id: '7', type: 'stackNode', position: getRandomPosition(), data: { idShort: '7', label: 'Express', category: 'Backend', icon: '🚂', description: 'Web server framework', isActive: false } },
  { id: '8', type: 'stackNode', position: getRandomPosition(), data: { idShort: '8', label: 'Firebase', category: 'Auth/DB', icon: '🔥', description: 'Realtime & Auth', isActive: false } },
  { id: '9', type: 'stackNode', position: getRandomPosition(), data: { idShort: '9', label: 'OpenRouter', category: 'AI Routing', icon: '🛰️', description: 'LLM routing', isActive: false } },
  { id: '10', type: 'stackNode', position: getRandomPosition(), data: { idShort: '10', label: 'Vite', category: 'Bundler', icon: '⚡', description: 'Fast dev server', isActive: false } },
  { id: '11', type: 'stackNode', position: getRandomPosition(), data: { idShort: '11', label: 'TypeScript', category: 'Language', icon: '📝', description: 'Typed JS', isActive: false } },
];

// --- Random edges showing connections ---
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e3-6', source: '3', target: '6', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e3-8', source: '3', target: '8', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e7-3', source: '7', target: '3', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e9-1', source: '9', target: '1', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
  { id: 'e10-11', source: '10', target: '11', type: 'smoothstep', animated: true, style: edgeStyle, markerEnd: { type: MarkerType.ArrowClosed, color: '#000' } },
];

// --- Custom node renderer (brutalist style) ---
const StackNode = ({ data, isConnectable }) => {
  const categoryColor = brutalistColors[data.category] || CYAN;
  const activeBg = data.isActive ? categoryColor : '#f4f4f4';
  
  return (
    <div style={{ width: 260 }} className="relative px-4 py-3 rounded-md border-4 border-black shadow-[6px_6px_0_#000] select-none" >
      {/* left input handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 18,
          height: 18,
          background: '#fff',
          border: '3px solid #000',
          borderRadius: '50%',
          left: -14,
        }}
      />

      {/* right output handle */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 18,
          height: 18,
          background: '#fff',
          border: '3px solid #000',
          borderRadius: '50%',
          right: -14,
        }}
      />

      <div style={{ background: activeBg, padding: 8, border: '2px solid #000' }}>
        <div className="flex items-start gap-3">
          <div style={{ 
            width: 44, 
            height: 44, 
            background: categoryColor, 
            border: '3px solid #000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 20,
            boxShadow: '3px 3px 0 #000',
          }}>
            {data.icon}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#000' }}>{data.label}</div>
            <div style={{ 
              fontSize: 11, 
              textTransform: 'uppercase', 
              color: categoryColor, 
              fontWeight: 700,
              textShadow: '1px 1px 0 #000',
            }}>
              {data.category}
            </div>
            <div style={{ fontSize: 12, color: '#222', maxWidth: 200, fontWeight: 500 }}>{data.description}</div>
          </div>
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
            markerEnd: { type: MarkerType.ArrowClosed, color: '#000' },
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
          connectionLineStyle={{ stroke: '#000', strokeWidth: 3 }}
        >
          <Controls
            style={{ 
              background: '#fff', 
              border: '3px solid #000', 
              borderRadius: 6, 
              boxShadow: '6px 6px 0 #000',
            }}
          />
          <MiniMap 
            nodeStrokeWidth={2} 
            nodeColor={(n) => {
              const catColor = brutalistColors[n.data.category] || CYAN;
              return n.data.isActive ? LIME : catColor;
            }} 
            style={{ 
              background: '#fff', 
              border: '3px solid #000',
            }} 
          />
          <Background gap={18} size={2} color="#222" />
        </ReactFlow>
      </div>
    </div>
  );
}
