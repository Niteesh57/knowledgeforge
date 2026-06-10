import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameLevel } from '../../../types/chat';
import { useGraphicsEra } from '../../../hooks/useGraphicsEra';

interface Props { level: GameLevel; onWin: () => void; }

interface NodeState { id: string; label: string; connected: boolean; }
interface EdgeState { from: string; to: string; correct: boolean; label: string; connected: boolean; }

export default function CircuitConnectGame({ level, onWin }: Props) {
  const era = useGraphicsEra();
  const rawItems = level.items as { from_node: string; to_node: string; correct: boolean; label: string }[];

  // Derive unique nodes
  const nodeIds = Array.from(new Set(rawItems.flatMap(e => [e.from_node, e.to_node])));
  const [nodes] = useState<NodeState[]>(nodeIds.map(id => ({ id, label: id, connected: false })));
  const [edges, setEdges] = useState<EdgeState[]>(
    rawItems.map(e => ({ from: e.from_node, to: e.to_node, correct: e.correct, label: e.label, connected: false }))
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [wrongEdge, setWrongEdge] = useState<string | null>(null);

  const NODE_POSITIONS: Record<string, { x: number; y: number }> = {};
  nodeIds.forEach((id, i) => {
    const angle = (i / nodeIds.length) * 2 * Math.PI - Math.PI / 2;
    NODE_POSITIONS[id] = {
      x: 50 + 35 * Math.cos(angle),
      y: 50 + 35 * Math.sin(angle),
    };
  });

  const handleNodeClick = (nodeId: string) => {
    if (!selectedNode) {
      setSelectedNode(nodeId);
      return;
    }
    if (selectedNode === nodeId) {
      setSelectedNode(null);
      return;
    }
    // Try to connect
    const edge = edges.find(
      e => (e.from === selectedNode && e.to === nodeId) || (e.from === nodeId && e.to === selectedNode)
    );
    if (!edge || edge.connected) {
      setSelectedNode(null);
      return;
    }
    if (edge.correct) {
      setEdges(prev => {
        const updated = prev.map(e =>
          (e.from === selectedNode && e.to === nodeId) || (e.from === nodeId && e.to === selectedNode)
            ? { ...e, connected: true }
            : e
        );
        if (updated.filter(e => e.correct).every(e => e.connected)) {
          setTimeout(onWin, 800);
        }
        return updated;
      });
    } else {
      setWrongEdge(`${selectedNode}-${nodeId}`);
      setTimeout(() => setWrongEdge(null), 700);
    }
    setSelectedNode(null);
  };

  const handleRevealAnswer = () => {
    setEdges(prev => {
      // Find the first unconnected correct edge
      const firstCorrect = prev.find(e => e.correct && !e.connected);
      if (!firstCorrect) return prev;
      
      const updated = prev.map(e => e === firstCorrect ? { ...e, connected: true } : e);
      if (updated.filter(e => e.correct).every(e => e.connected)) {
        setTimeout(onWin, 800);
      }
      return updated;
    });
    setSelectedNode(null);
  };

  const correctEdges = edges.filter(e => e.correct && e.connected).length;
  const totalCorrectEdges = edges.filter(e => e.correct).length;

  return (
    <div className="flex flex-col gap-3 p-4 font-mono h-full">
      <div className="flex justify-between text-[12px] items-center">
        <div className="flex gap-4">
          <span>🔌 Connected: <b>{correctEdges}</b> / {totalCorrectEdges}</span>
          <span className="opacity-50">{selectedNode ? `Connecting from: ${selectedNode}` : 'Click a node to start'}</span>
        </div>
        <button type="button" onClick={handleRevealAnswer} className="text-[11px] text-[#ff0055] opacity-70 hover:opacity-100 font-bold transition-opacity">
          [REVEAL ANSWER]
        </button>
      </div>

      {/* Circuit canvas */}
      <div className={`relative flex-1 min-h-[300px] rounded-xl overflow-hidden ${
        era === '2026s' ? 'bg-[#0b0615] border border-white/10' :
        era === '2000s' ? 'win95-sunken bg-white' :
        'bg-black border border-[#1a1a1a]'
      }`}>
        {/* SVG edges */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          {edges.map((e, i) => {
            const from = NODE_POSITIONS[e.from];
            const to = NODE_POSITIONS[e.to];
            if (!from || !to) return null;
            const isWrong = wrongEdge === `${e.from}-${e.to}` || wrongEdge === `${e.to}-${e.from}`;
            return (
              <line
                key={i}
                x1={`${from.x}%`} y1={`${from.y}%`}
                x2={`${to.x}%`} y2={`${to.y}%`}
                stroke={e.connected ? (era === '2026s' ? '#a855f7' : 'var(--theme-primary)') : isWrong ? '#ef4444' : '#2a2a2a'}
                strokeWidth={e.connected ? 2.5 : 1}
                strokeDasharray={e.connected ? 'none' : '4 4'}
                opacity={e.connected ? 1 : 0.4}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => {
          const pos = NODE_POSITIONS[node.id];
          if (!pos) return null;
          return (
            <motion.button
              key={node.id}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNodeClick(node.id)}
              className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-[12px] font-bold border-2 cursor-pointer transition-all -translate-x-1/2 -translate-y-1/2 ${
                selectedNode === node.id
                  ? 'border-yellow-400 text-yellow-300 bg-yellow-400/20 scale-110'
                  : era === '2026s'
                  ? 'border-[#a855f7]/60 text-[#d8b4fe] bg-[#a855f7]/10 hover:bg-[#a855f7]/20'
                  : era === '2000s'
                  ? 'win95-raised border-[#000080] text-[#000080]'
                  : 'border-primary-fixed-dim/40 text-primary-fixed-dim bg-primary-fixed-dim/5 hover:bg-primary-fixed-dim/15'
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {node.label.length > 5 ? node.label.slice(0, 5) : node.label}
            </motion.button>
          );
        })}
      </div>

      {/* Edge labels guide */}
      <div className="flex flex-wrap gap-2">
        {edges.filter(e => e.correct).map((e, i) => (
          <span key={i} className={`text-[10px] px-2 py-1 rounded border transition-colors ${
            e.connected
              ? 'border-green-400 text-green-300 bg-green-900/20'
              : 'border-[#2a2a2a] text-on-surface-variant/50'
          }`}>
            {e.label}: {e.from} → {e.to}
          </span>
        ))}
      </div>
      <p className="text-[11px] opacity-40 text-center">Click two nodes to connect them with the right wires.</p>
    </div>
  );
}
