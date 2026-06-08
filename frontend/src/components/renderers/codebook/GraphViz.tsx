import { motion } from 'framer-motion';
import type { VizNode, VizEdge } from '../../../types/chat';

interface Props { nodes: VizNode[]; edges: VizEdge[]; queue: string[]; era: string; }

export default function GraphViz({ nodes, edges, queue, era }: Props) {
  const accentColor = era === '2026s' ? '#a855f7' : era === '2000s' ? '#000080' : 'var(--theme-primary)';
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  return (
    <div className="relative flex flex-col h-full p-4 gap-3">
      {/* SVG for edges */}
      <div className="relative flex-1" style={{ minHeight: 200 }}>
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2a2a2a" />
            </marker>
          </defs>
          {edges.map((edge, i) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            return (
              <motion.line
                key={i}
                x1={`${from.x}%`} y1={`${from.y}%`}
                x2={`${to.x}%`} y2={`${to.y}%`}
                animate={{
                  stroke: edge.active ? accentColor : era === '2000s' ? '#808080' : '#2a2a2a',
                  strokeWidth: edge.active ? 2.5 : 1.5,
                }}
                markerEnd={edge.directed ? 'url(#arrowhead)' : undefined}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <motion.div
            key={node.id}
            className="absolute w-12 h-12 rounded-full flex items-center justify-center border-2 font-mono font-bold text-[13px] -translate-x-1/2 -translate-y-1/2"
            animate={{
              borderColor: node.active ? accentColor : node.visited ? 'rgb(74,222,128)' : era === '2000s' ? '#808080' : '#2a2a2a',
              backgroundColor: node.active
                ? era === '2026s' ? 'rgba(168,85,247,0.3)' : 'rgba(0,230,57,0.15)'
                : node.visited
                ? 'rgba(74,222,128,0.15)'
                : era === '2000s' ? '#efeded' : '#111',
              boxShadow: node.active ? `0 0 14px ${accentColor}88` : 'none',
            }}
            transition={{ duration: 0.3 }}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <motion.span
              key={node.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: node.active ? accentColor : node.visited ? 'rgb(74,222,128)' : undefined }}
            >
              {node.label}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Queue / Stack display */}
      {queue && queue.length > 0 && (
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="opacity-40">Queue/Stack:</span>
          <div className="flex gap-1">
            {queue.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-1 rounded border text-[11px]"
                style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}15` }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
