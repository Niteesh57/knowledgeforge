import { motion } from 'framer-motion';
import type { VizNode } from '../../../types/chat';

interface Props { nodes: VizNode[]; root: string | undefined; era: string; }

// Layout: BFS-based position calculation
function layoutTree(nodes: VizNode[], root: string | undefined) {
  if (!root) return {};
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const positions: Record<string, { x: number; y: number }> = {};
  const queue: [string, number, number, number][] = [[root, 250, 40, 200]];
  while (queue.length > 0) {
    const [id, x, y, spread] = queue.shift()!;
    positions[id] = { x, y };
    const node = nodeMap[id];
    if (!node) continue;
    if (node.left) queue.push([node.left, x - spread, y + 70, spread / 2]);
    if (node.right) queue.push([node.right, x + spread, y + 70, spread / 2]);
  }
  return positions;
}

export default function BinaryTreeViz({ nodes, root, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const positions = layoutTree(nodes, root);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Collect edges for SVG
  const edges: { x1: number; y1: number; x2: number; y2: number; active: boolean }[] = [];
  nodes.forEach(node => {
    const from = positions[node.id];
    if (!from) return;
    [node.left, node.right].forEach(childId => {
      if (childId && positions[childId]) {
        const to = positions[childId];
        edges.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, active: node.active || nodeMap[childId]?.active || false });
      }
    });
  });

  return (
    <div className="relative w-full h-full" style={{ minHeight: 280 }}>
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        {edges.map((e, i) => (
          <motion.line
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, stroke: e.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a' }}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            strokeWidth={e.active ? 2 : 1.5}
          />
        ))}
      </svg>
      {nodes.map(node => {
        const pos = positions[node.id];
        if (!pos) return null;
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1, scale: node.active ? 1.1 : 1,
              left: pos.x - 24,
              top: pos.y - 24,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="absolute w-12 h-12 rounded-full flex flex-col items-center justify-center border-2 font-mono font-bold text-[12px]"
            style={{
              borderColor: node.active ? accentColor : era === '2000s' ? '#808080' : '#3a3a3a',
              backgroundColor: node.active
                ? era === '2026s' ? 'rgba(168,85,247,0.25)' : 'rgba(0,230,57,0.15)'
                : era === '2000s' ? '#efeded' : '#111',
              boxShadow: node.active ? `0 0 14px ${accentColor}66` : 'none',
              color: node.active ? accentColor : undefined,
            }}
          >
            <span className="text-[9px] opacity-40">{node.label}</span>
            <motion.span key={node.value} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {node.value}
            </motion.span>
          </motion.div>
        );
      })}
    </div>
  );
}
